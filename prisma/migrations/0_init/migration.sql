-- CreateTable
CREATE TABLE `Activity` (
    `activity_id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `activity_description` VARCHAR(255) NULL,
    `logs_data` VARCHAR(255) NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `activity_id`(`activity_id`),
    INDEX `Activity_admin_id_FK`(`admin_id`),
    PRIMARY KEY (`activity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `privilege` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `admin_id`(`admin_id`),
    INDEX `Admin_user_id_FK`(`user_id`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ballot` (
    `ballot_id` INTEGER NOT NULL AUTO_INCREMENT,
    `election_id` INTEGER NOT NULL,
    `ballot_title` VARCHAR(45) NOT NULL,
    `ballot_description` VARCHAR(255) NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ballot_result` VARCHAR(255) NULL,

    UNIQUE INDEX `ballot_id`(`ballot_id`),
    INDEX `Ballot_election_id_FK`(`election_id`),
    PRIMARY KEY (`ballot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidate` (
    `candidate_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ballot_id` INTEGER NOT NULL,
    `name` VARCHAR(45) NOT NULL,
    `description` TEXT NULL,
    `bio` VARCHAR(255) NULL,
    `picture` VARCHAR(255) NOT NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `candidate_id`(`candidate_id`),
    INDEX `Candidate_ballot_id_FK`(`ballot_id`),
    PRIMARY KEY (`candidate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Election` (
    `election_id` INTEGER NOT NULL AUTO_INCREMENT,
    `public_key` VARCHAR(255) NOT NULL,
    `election_title` VARCHAR(255) NOT NULL,
    `election_description` VARCHAR(255) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `election_id`(`election_id`),
    UNIQUE INDEX `public_key`(`public_key`),
    UNIQUE INDEX `election_title`(`election_title`),
    PRIMARY KEY (`election_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(45) NOT NULL,
    `hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(45) NULL,
    `email` VARCHAR(255) NULL,
    `date_created` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_id`(`user_id`),
    UNIQUE INDEX `username`(`username`),
    UNIQUE INDEX `password_hash`(`hash`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vote` (
    `vote_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ballot_id` INTEGER NOT NULL,
    `vote_data` LONGTEXT NOT NULL,

    UNIQUE INDEX `vote_id`(`vote_id`),
    INDEX `Vote_ballot_id_FK`(`ballot_id`),
    PRIMARY KEY (`vote_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voter` (
    `voter_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `election_id` INTEGER NOT NULL,
    `vote_status` BOOLEAN NULL DEFAULT false,
    `date_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `voter_id`(`voter_id`),
    INDEX `Voter_election_id_FK`(`election_id`),
    INDEX `Voter_user_id_FK`(`user_id`),
    PRIMARY KEY (`voter_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_admin_id_FK` FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`admin_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Ballot` ADD CONSTRAINT `Ballot_election_id_FK` FOREIGN KEY (`election_id`) REFERENCES `Election`(`election_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Candidate` ADD CONSTRAINT `Candidate_ballot_id_FK` FOREIGN KEY (`ballot_id`) REFERENCES `Ballot`(`ballot_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_ballot_id_FK` FOREIGN KEY (`ballot_id`) REFERENCES `Election`(`election_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Voter` ADD CONSTRAINT `Voter_election_id_FK` FOREIGN KEY (`election_id`) REFERENCES `Election`(`election_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Voter` ADD CONSTRAINT `Voter_user_id_FK` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

