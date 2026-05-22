-- Add VerificationStatus enum values to the organization table
ALTER TABLE `organization` ADD COLUMN `verification_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' AFTER `verified`;

-- Add rejection tracking columns
ALTER TABLE `organization` ADD COLUMN `rejected_at` DATETIME(3) AFTER `verified_by`;
ALTER TABLE `organization` ADD COLUMN `rejected_by` VARCHAR(191) AFTER `rejected_at`;
ALTER TABLE `organization` ADD COLUMN `rejection_reason` LONGTEXT AFTER `rejected_by`;

-- Update existing organizations to have APPROVED status if they are already verified
UPDATE `organization` SET `verification_status` = 'APPROVED' WHERE `verified` = true;

-- Create index for faster filtering by verification_status
CREATE INDEX `organization_verification_status_idx` ON `organization`(`verification_status`);
