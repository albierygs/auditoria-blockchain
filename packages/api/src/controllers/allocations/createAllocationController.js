const { db } = require("../../utils/db");
const ApiException = require("../../exceptions/apiException");
const BlockchainService = require("../../services/blockchainService");
const StatusHistoryService = require("../../services/statusHistoryService");
const AllocationService = require("../../services/allocationService");
const ProjectService = require("../../services/projectService");

const createAllocation = async (req, res) => {
  const { donation_id, project_id, amount_allocated, organization_id } =
    req.body;

  // Verificar se a doação existe
  const donation = await db.donation.findUnique({
    where: {
      public_id: donation_id,
    },
  });

  if (!donation) {
    throw new ApiException("Doação não encontrada", 404);
  }

  // Verificar se o projeto existe
  const project = await db.project.findUnique({
    where: {
      public_id: project_id,
    },
  });

  if (!project) {
    throw new ApiException("Projeto não encontrado", 404);
  }

  // Verificar se a organização existe (se fornecida)
  if (organization_id) {
    const organization = await db.organization.findUnique({
      where: {
        public_id: organization_id,
      },
    });

    if (!organization) {
      throw new ApiException("Organização não encontrada", 404);
    }
  }

  // VALIDAÇÃO CRÍTICA: Verificar saldo disponível da doação
  const allocationValidation = await AllocationService.validateAllocation(
    donation_id,
    parseFloat(amount_allocated)
  );

  if (!allocationValidation.isValid) {
    throw new ApiException(allocationValidation.error, 400);
  }

  // Criar a nova alocação
  const newAllocation = await db.allocation.create({
    data: {
      donation_id,
      project_id,
      amount_allocated: parseFloat(amount_allocated),
      organizationId: organization_id || null,
    },
    include: {
      donation: {
        select: {
          public_id: true,
          value: true,
          donor: {
            select: {
              person: {
                select: {
                  name: true,
                  public_id: true,
                },
              },
            },
          },
        },
      },
      project: {
        select: {
          public_id: true,
          title: true,
        },
      },
      organization: {
        select: {
          public_id: true,
          name: true,
        },
      },
    },
  });

  try {
    // Registrar automaticamente a transação blockchain
    const blockchainTransaction = await BlockchainService.recordTransaction({
      type: "ALLOCATION",
      network: "ETHEREUM_TESTNET",
      value: parseFloat(amount_allocated),
      allocation_id: newAllocation.public_id,
      from_address: donation.donor_id,
      to_address: project_id,
    });

    // Registrar mudança de status no status_history
    await StatusHistoryService.recordStatusChange(
      "ALLOCATION",
      newAllocation.public_id,
      "PENDING",
      "CONFIRMED",
      req.user.publicId,
      "Alocação criada e registrada no blockchain",
      {
        amount_allocated: parseFloat(amount_allocated),
        donation_id,
        project_id,
      }
    );

    // Atualizar collected_amount do projeto
    const updatedProject =
      await ProjectService.updateCollectedAmount(project_id);

    // Obter informações de alocação atualizada
    const allocationInfo =
      await AllocationService.getAllocationInfo(donation_id);

    // Obter informações de coleta do projeto
    const projectCollectionInfo =
      await ProjectService.getCollectionInfo(project_id);

    // Retornar a alocação com os dados da transação blockchain
    const allocationWithBlockchain = {
      ...newAllocation,
      blockchain_transaction: {
        public_id: blockchainTransaction.public_id,
        hash: blockchainTransaction.hash,
        status: blockchainTransaction.status,
        network: blockchainTransaction.network,
        block_number: blockchainTransaction.block_number,
        confirmations: blockchainTransaction.confirmations,
        timestamp: blockchainTransaction.timestamp,
      },
      allocation_info: {
        total_allocated: allocationInfo.allocation_summary.total_allocated,
        available_balance: allocationInfo.allocation_summary.available_balance,
        allocation_percentage:
          allocationInfo.allocation_summary.allocation_percentage,
      },
      project_info: {
        collected_amount: updatedProject.collected_amount,
        budget: updatedProject.budget,
        collection_percentage:
          projectCollectionInfo.collection_summary.collection_percentage,
        remaining_amount:
          projectCollectionInfo.collection_summary.remaining_amount,
      },
    };

    res.status(201).json(allocationWithBlockchain);
  } catch (blockchainError) {
    // Se houver erro no blockchain, ainda retornar a alocação criada
    console.error("Erro ao registrar transação blockchain:", blockchainError);

    // Atualizar collected_amount do projeto mesmo com erro no blockchain
    const updatedProject =
      await ProjectService.updateCollectedAmount(project_id);
    const allocationInfo =
      await AllocationService.getAllocationInfo(donation_id);
    const projectCollectionInfo =
      await ProjectService.getCollectionInfo(project_id);

    const allocationWithError = {
      ...newAllocation,
      blockchain_error:
        "Falha ao registrar transação blockchain. Tente novamente mais tarde.",
      blockchain_transaction: null,
      allocation_info: {
        total_allocated: allocationInfo.allocation_summary.total_allocated,
        available_balance: allocationInfo.allocation_summary.available_balance,
        allocation_percentage:
          allocationInfo.allocation_summary.allocation_percentage,
      },
      project_info: {
        collected_amount: updatedProject.collected_amount,
        budget: updatedProject.budget,
        collection_percentage:
          projectCollectionInfo.collection_summary.collection_percentage,
        remaining_amount:
          projectCollectionInfo.collection_summary.remaining_amount,
      },
    };

    res.status(201).json(allocationWithError);
  }
};

module.exports = createAllocation;
