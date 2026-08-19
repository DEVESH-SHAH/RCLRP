/*
========================================================
🔥 LOYALTY REWARDS SYSTEM - MSSQL SERVER DATABASE
========================================================

Complete database schema for Loyalty Rewards System
Compatible with:
- Microsoft SQL Server 2019+
- Windows Authentication
- FastAPI + SQLAlchemy ORM
- QR-based point redemption workflow

Author: Senior Database Architect
Created: December 2024
*/

-- ========================================================
-- 🔥 PART 1: CREATE DATABASE
-- ========================================================

-- Create the database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LoyaltyDB')
BEGIN
    CREATE DATABASE LoyaltyDB;
END
GO

USE LoyaltyDB;
GO

-- ========================================================
-- 🔥 PART 2: ER DIAGRAM (TEXT VERSION)
-- ========================================================

/*
ENTITY RELATIONSHIP DIAGRAM:

CUSTOMERS (1) ←→ (M) TRANSACTIONS (M) ←→ (1) STORES
    ↓                    ↓                    ↓
    |              (M) ←→ (1)            (1) ←→ (1)
    |                 USERS              USERS
    |                                 (managers)
    ↓
(M) ←→ (1) QR_SCAN_LOGS (M) ←→ (1) STORES
         ↓
    (M) ←→ (1) USERS

RELATIONSHIPS:
- Customer HAS MANY Transactions
- Store HAS MANY Transactions  
- User (Manager) PERFORMS MANY Transactions
- Store HAS ONE Manager (User)
- Customer HAS MANY QR Scan Logs
- Store HAS MANY QR Scan Logs
- User (Manager) HAS MANY QR Scan Logs
- Rewards are referenced through Transactions
- Campaigns are independent (optional)
*/

-- ========================================================
-- 🔥 PART 3: CREATE TABLES WITH CONSTRAINTS
-- ========================================================

-- Drop tables in correct order (foreign key dependencies)
IF OBJECT_ID('QR_SCAN_LOGS', 'U') IS NOT NULL DROP TABLE QR_SCAN_LOGS;
IF OBJECT_ID('TRANSACTIONS', 'U') IS NOT NULL DROP TABLE TRANSACTIONS;
IF OBJECT_ID('CAMPAIGNS', 'U') IS NOT NULL DROP TABLE CAMPAIGNS;
IF OBJECT_ID('REWARDS', 'U') IS NOT NULL DROP TABLE REWARDS;
IF OBJECT_ID('STORES', 'U') IS NOT NULL DROP TABLE STORES;
IF OBJECT_ID('USERS', 'U') IS NOT NULL DROP TABLE USERS;
IF OBJECT_ID('CUSTOMERS', 'U') IS NOT NULL DROP TABLE CUSTOMERS;
GO

-- ========================================================
-- 🔥 TABLE 1: CUSTOMERS
-- ========================================================

CREATE TABLE CUSTOMERS (
    customer_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL UNIQUE,
    email NVARCHAR(100) NULL UNIQUE,
    tier NVARCHAR(20) NOT NULL DEFAULT 'bronze' 
        CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    wallet_points INT NOT NULL DEFAULT 0 
        CHECK (wallet_points >= 0),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NULL,
    
    -- Indexes for performance
    INDEX IX_CUSTOMERS_phone (phone),
    INDEX IX_CUSTOMERS_email (email),
    INDEX IX_CUSTOMERS_tier (tier),
    INDEX IX_CUSTOMERS_created_at (created_at)
);
GO

-- ========================================================
-- 🔥 TABLE 2: USERS (Staff: Admin, Manager, Marketing)
-- ========================================================

CREATE TABLE USERS (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL 
        CHECK (role IN ('admin', 'manager', 'marketing', 'support')),
    store_id INT NULL, -- FK to STORES (for managers)
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Indexes
    INDEX IX_USERS_email (email),
    INDEX IX_USERS_role (role),
    INDEX IX_USERS_store_id (store_id),
    INDEX IX_USERS_active (active)
);
GO

-- ========================================================
-- 🔥 TABLE 3: STORES
-- ========================================================

CREATE TABLE STORES (
    store_id INT IDENTITY(1,1) PRIMARY KEY,
    store_name NVARCHAR(100) NOT NULL,
    store_code NVARCHAR(50) NOT NULL UNIQUE,
    location NVARCHAR(255) NOT NULL,
    manager_user_id INT NULL, -- FK to USERS
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign Key Constraints
    CONSTRAINT FK_STORES_manager_user_id 
        FOREIGN KEY (manager_user_id) REFERENCES USERS(user_id),
    
    -- Indexes
    INDEX IX_STORES_store_code (store_code),
    INDEX IX_STORES_manager_user_id (manager_user_id),
    INDEX IX_STORES_active (active)
);
GO

-- Add FK constraint from USERS to STORES (circular reference handled)
ALTER TABLE USERS 
ADD CONSTRAINT FK_USERS_store_id 
    FOREIGN KEY (store_id) REFERENCES STORES(store_id);
GO

-- ========================================================
-- 🔥 TABLE 4: REWARDS
-- ========================================================

CREATE TABLE REWARDS (
    reward_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    image_url NVARCHAR(255) NULL,
    points_required INT NOT NULL 
        CHECK (points_required > 0),
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NULL,
    
    -- Indexes
    INDEX IX_REWARDS_points_required (points_required),
    INDEX IX_REWARDS_active (active),
    INDEX IX_REWARDS_created_at (created_at)
);
GO

-- ========================================================
-- 🔥 TABLE 5: TRANSACTIONS
-- ========================================================

CREATE TABLE TRANSACTIONS (
    transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    store_id INT NOT NULL,
    manager_id INT NULL, -- User who processed (for REDEEM transactions)
    type NVARCHAR(10) NOT NULL 
        CHECK (type IN ('EARN', 'REDEEM')),
    points INT NOT NULL 
        CHECK (points > 0),
    description NVARCHAR(255) NULL,
    reward_id INT NULL, -- Optional: link to redeemed reward
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign Key Constraints
    CONSTRAINT FK_TRANSACTIONS_customer_id 
        FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    CONSTRAINT FK_TRANSACTIONS_store_id 
        FOREIGN KEY (store_id) REFERENCES STORES(store_id),
    CONSTRAINT FK_TRANSACTIONS_manager_id 
        FOREIGN KEY (manager_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_TRANSACTIONS_reward_id 
        FOREIGN KEY (reward_id) REFERENCES REWARDS(reward_id),
    
    -- Indexes for performance
    INDEX IX_TRANSACTIONS_customer_id (customer_id),
    INDEX IX_TRANSACTIONS_store_id (store_id),
    INDEX IX_TRANSACTIONS_manager_id (manager_id),
    INDEX IX_TRANSACTIONS_type (type),
    INDEX IX_TRANSACTIONS_created_at (created_at),
    INDEX IX_TRANSACTIONS_customer_created (customer_id, created_at),
    INDEX IX_TRANSACTIONS_store_created (store_id, created_at)
);
GO

-- ========================================================
-- 🔥 TABLE 6: QR_SCAN_LOGS
-- ========================================================

CREATE TABLE QR_SCAN_LOGS (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NULL, -- NULL if scan failed before customer identification
    store_id INT NOT NULL,
    manager_id INT NOT NULL, -- User who performed the scan
    status NVARCHAR(20) NOT NULL 
        CHECK (status IN ('success', 'fail', 'expired', 'invalid', 'insufficient_points')),
    raw_token NVARCHAR(MAX) NULL, -- Store the QR token for debugging
    error_message NVARCHAR(255) NULL,
    points_redeemed INT NULL, -- Points redeemed (if successful)
    transaction_id INT NULL, -- Link to created transaction (if successful)
    timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign Key Constraints
    CONSTRAINT FK_QR_SCAN_LOGS_customer_id 
        FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    CONSTRAINT FK_QR_SCAN_LOGS_store_id 
        FOREIGN KEY (store_id) REFERENCES STORES(store_id),
    CONSTRAINT FK_QR_SCAN_LOGS_manager_id 
        FOREIGN KEY (manager_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_QR_SCAN_LOGS_transaction_id 
        FOREIGN KEY (transaction_id) REFERENCES TRANSACTIONS(transaction_id),
    
    -- Indexes
    INDEX IX_QR_SCAN_LOGS_customer_id (customer_id),
    INDEX IX_QR_SCAN_LOGS_store_id (store_id),
    INDEX IX_QR_SCAN_LOGS_manager_id (manager_id),
    INDEX IX_QR_SCAN_LOGS_status (status),
    INDEX IX_QR_SCAN_LOGS_timestamp (timestamp),
    INDEX IX_QR_SCAN_LOGS_store_timestamp (store_id, timestamp)
);
GO

-- ========================================================
-- 🔥 TABLE 7: CAMPAIGNS (Optional - Marketing)
-- ========================================================

CREATE TABLE CAMPAIGNS (
    campaign_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    bonus_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00 
        CHECK (bonus_multiplier >= 1.00 AND bonus_multiplier <= 10.00),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Business Rules
    CONSTRAINT CK_CAMPAIGNS_date_range 
        CHECK (end_date >= start_date),
    
    -- Indexes
    INDEX IX_CAMPAIGNS_status (status),
    INDEX IX_CAMPAIGNS_dates (start_date, end_date),
    INDEX IX_CAMPAIGNS_created_at (created_at)
);
GO

-- ========================================================
-- 🔥 PART 4: ADDITIONAL CONSTRAINTS & TRIGGERS
-- ========================================================

-- Trigger to update customer updated_at timestamp
CREATE TRIGGER TR_CUSTOMERS_UpdateTimestamp
ON CUSTOMERS
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CUSTOMERS 
    SET updated_at = GETUTCDATE()
    WHERE customer_id IN (SELECT customer_id FROM inserted);
END
GO

-- Trigger to update rewards updated_at timestamp
CREATE TRIGGER TR_REWARDS_UpdateTimestamp
ON REWARDS
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE REWARDS 
    SET updated_at = GETUTCDATE()
    WHERE reward_id IN (SELECT reward_id FROM inserted);
END
GO

-- ========================================================
-- 🔥 PART 5: VIEWS FOR COMMON QUERIES
-- ========================================================

-- View: Customer Summary with Transaction Stats
CREATE VIEW VW_CUSTOMER_SUMMARY AS
SELECT 
    c.customer_id,
    c.name,
    c.phone,
    c.email,
    c.tier,
    c.wallet_points,
    c.created_at,
    ISNULL(t_earn.total_earned, 0) as total_points_earned,
    ISNULL(t_redeem.total_redeemed, 0) as total_points_redeemed,
    ISNULL(t_earn.earn_count, 0) as total_earn_transactions,
    ISNULL(t_redeem.redeem_count, 0) as total_redeem_transactions
FROM CUSTOMERS c
LEFT JOIN (
    SELECT 
        customer_id, 
        SUM(points) as total_earned,
        COUNT(*) as earn_count
    FROM TRANSACTIONS 
    WHERE type = 'EARN' 
    GROUP BY customer_id
) t_earn ON c.customer_id = t_earn.customer_id
LEFT JOIN (
    SELECT 
        customer_id, 
        SUM(points) as total_redeemed,
        COUNT(*) as redeem_count
    FROM TRANSACTIONS 
    WHERE type = 'REDEEM' 
    GROUP BY customer_id
) t_redeem ON c.customer_id = t_redeem.customer_id;
GO

-- View: Store Performance Analytics
CREATE VIEW VW_STORE_ANALYTICS AS
SELECT 
    s.store_id,
    s.store_name,
    s.store_code,
    s.location,
    u.name as manager_name,
    ISNULL(t.total_transactions, 0) as total_transactions,
    ISNULL(t.total_points_redeemed, 0) as total_points_redeemed,
    ISNULL(qr.total_scans, 0) as total_qr_scans,
    ISNULL(qr.successful_scans, 0) as successful_qr_scans,
    CASE 
        WHEN ISNULL(qr.total_scans, 0) = 0 THEN 0 
        ELSE CAST(ISNULL(qr.successful_scans, 0) * 100.0 / qr.total_scans AS DECIMAL(5,2))
    END as qr_success_rate
FROM STORES s
LEFT JOIN USERS u ON s.manager_user_id = u.user_id
LEFT JOIN (
    SELECT 
        store_id,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'REDEEM' THEN points ELSE 0 END) as total_points_redeemed
    FROM TRANSACTIONS
    GROUP BY store_id
) t ON s.store_id = t.store_id
LEFT JOIN (
    SELECT 
        store_id,
        COUNT(*) as total_scans,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_scans
    FROM QR_SCAN_LOGS
    GROUP BY store_id
) qr ON s.store_id = qr.store_id
WHERE s.active = 1;
GO

-- ========================================================
-- 🔥 PART 6: STORED PROCEDURES
-- ========================================================

-- Procedure: Process QR Code Redemption
CREATE PROCEDURE SP_ProcessQRRedemption
    @customer_id INT,
    @store_id INT,
    @manager_id INT,
    @points_to_redeem INT,
    @description NVARCHAR(255) = NULL,
    @result_code INT OUTPUT,
    @result_message NVARCHAR(255) OUTPUT,
    @transaction_id INT OUTPUT,
    @remaining_balance INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @current_points INT;
    
    -- Check if customer exists and get current points
    SELECT @current_points = wallet_points 
    FROM CUSTOMERS 
    WHERE customer_id = @customer_id;
    
    IF @current_points IS NULL
    BEGIN
        SET @result_code = -1;
        SET @result_message = 'Customer not found';
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Check if customer has sufficient points
    IF @current_points < @points_to_redeem
    BEGIN
        SET @result_code = -2;
        SET @result_message = 'Insufficient points balance';
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Deduct points from customer wallet
    UPDATE CUSTOMERS 
    SET wallet_points = wallet_points - @points_to_redeem,
        updated_at = GETUTCDATE()
    WHERE customer_id = @customer_id;
    
    -- Create transaction record
    INSERT INTO TRANSACTIONS (customer_id, store_id, manager_id, type, points, description)
    VALUES (@customer_id, @store_id, @manager_id, 'REDEEM', @points_to_redeem, @description);
    
    SET @transaction_id = SCOPE_IDENTITY();
    SET @remaining_balance = @current_points - @points_to_redeem;
    
    -- Log successful QR scan
    INSERT INTO QR_SCAN_LOGS (customer_id, store_id, manager_id, status, points_redeemed, transaction_id)
    VALUES (@customer_id, @store_id, @manager_id, 'success', @points_to_redeem, @transaction_id);
    
    SET @result_code = 0;
    SET @result_message = 'Redemption successful';
    
    COMMIT TRANSACTION;
END
GO

-- Procedure: Add Points to Customer (Earn Transaction)
CREATE PROCEDURE SP_AddCustomerPoints
    @customer_id INT,
    @store_id INT,
    @points_to_add INT,
    @description NVARCHAR(255) = NULL,
    @result_code INT OUTPUT,
    @result_message NVARCHAR(255) OUTPUT,
    @new_balance INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    -- Check if customer exists
    IF NOT EXISTS (SELECT 1 FROM CUSTOMERS WHERE customer_id = @customer_id)
    BEGIN
        SET @result_code = -1;
        SET @result_message = 'Customer not found';
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Add points to customer wallet
    UPDATE CUSTOMERS 
    SET wallet_points = wallet_points + @points_to_add,
        updated_at = GETUTCDATE()
    WHERE customer_id = @customer_id;
    
    -- Get new balance
    SELECT @new_balance = wallet_points 
    FROM CUSTOMERS 
    WHERE customer_id = @customer_id;
    
    -- Create transaction record
    INSERT INTO TRANSACTIONS (customer_id, store_id, type, points, description)
    VALUES (@customer_id, @store_id, 'EARN', @points_to_add, @description);
    
    SET @result_code = 0;
    SET @result_message = 'Points added successfully';
    
    COMMIT TRANSACTION;
END
GO

-- ========================================================
-- 🔥 PART 7: SAMPLE DATA FOR TESTING
-- ========================================================

-- Insert Sample Users
INSERT INTO USERS (name, email, password_hash, role) VALUES
('System Admin', 'admin@loyaltyrewards.com', 'hashed_password_1', 'admin'),
('Marketing Manager', 'marketing@loyaltyrewards.com', 'hashed_password_2', 'marketing'),
('Support Agent', 'support@loyaltyrewards.com', 'hashed_password_3', 'support');

-- Insert Sample Stores
INSERT INTO STORES (store_name, store_code, location) VALUES
('Downtown Store', 'DS001', '123 Main Street, Downtown'),
('Mall Location', 'ML002', '456 Shopping Mall, Level 2'),
('Airport Branch', 'AB003', '789 Airport Terminal, Gate A');

-- Insert Store Managers
INSERT INTO USERS (name, email, password_hash, role, store_id) VALUES
('John Manager', 'manager.downtown@loyaltyrewards.com', 'hashed_password_4', 'manager', 1),
('Jane Manager', 'manager.mall@loyaltyrewards.com', 'hashed_password_5', 'manager', 2);

-- Update stores with managers
UPDATE STORES SET manager_user_id = 4 WHERE store_id = 1;
UPDATE STORES SET manager_user_id = 5 WHERE store_id = 2;

-- Insert Sample Customers
INSERT INTO CUSTOMERS (name, phone, email, tier, wallet_points) VALUES
('John Doe', '+1234567890', 'john.doe@example.com', 'gold', 2450),
('Jane Smith', '+1234567891', 'jane.smith@example.com', 'silver', 1230),
('Mike Johnson', '+1234567892', 'mike.johnson@example.com', 'platinum', 5670),
('Sarah Wilson', '+1234567893', 'sarah.wilson@example.com', 'bronze', 450);

-- Insert Sample Rewards
INSERT INTO REWARDS (name, description, points_required) VALUES
('$5 Coffee Voucher', 'Enjoy a free coffee at any partner cafe', 500),
('$10 Store Credit', 'Store credit for any purchase', 1000),
('Free Lunch Combo', 'Complete lunch combo meal', 750),
('Premium Membership', '1 year premium membership benefits', 5000);

-- Insert Sample Transactions
INSERT INTO TRANSACTIONS (customer_id, store_id, manager_id, type, points, description) VALUES
(1, 1, 4, 'EARN', 200, 'Purchase bonus points'),
(1, 1, 4, 'REDEEM', 500, 'Redeemed $5 Coffee Voucher'),
(2, 2, 5, 'EARN', 150, 'Welcome bonus'),
(2, 2, 5, 'REDEEM', 300, 'Redeemed store credit'),
(3, 1, 4, 'EARN', 1000, 'Large purchase bonus'),
(4, 1, 4, 'EARN', 100, 'Small purchase');

-- Insert Sample QR Scan Logs
INSERT INTO QR_SCAN_LOGS (customer_id, store_id, manager_id, status, points_redeemed, transaction_id) VALUES
(1, 1, 4, 'success', 500, 2),
(2, 2, 5, 'success', 300, 4),
(NULL, 1, 4, 'expired', NULL, NULL),
(3, 1, 4, 'fail', NULL, NULL);

-- Insert Sample Campaign
INSERT INTO CAMPAIGNS (name, description, bonus_multiplier, start_date, end_date, status) VALUES
('Holiday Bonus Points', 'Double points on all purchases during holidays', 2.00, '2024-12-01', '2024-12-31', 'active'),
('Weekend Double Points', 'Extra points on weekend purchases', 2.00, '2024-11-01', '2024-12-31', 'active');

GO

-- ========================================================
-- 🔥 PART 8: PERFORMANCE INDEXES
-- ========================================================

-- Additional composite indexes for common queries
CREATE INDEX IX_TRANSACTIONS_customer_type_date ON TRANSACTIONS (customer_id, type, created_at);
CREATE INDEX IX_TRANSACTIONS_store_type_date ON TRANSACTIONS (store_id, type, created_at);
CREATE INDEX IX_QR_SCAN_LOGS_store_status_date ON QR_SCAN_LOGS (store_id, status, timestamp);
CREATE INDEX IX_CUSTOMERS_tier_points ON CUSTOMERS (tier, wallet_points);

-- ========================================================
-- 🔥 PART 9: SECURITY & PERMISSIONS
-- ========================================================

-- Create application roles
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'loyalty_app_role')
    CREATE ROLE loyalty_app_role;

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'loyalty_readonly_role')
    CREATE ROLE loyalty_readonly_role;

-- Grant permissions to application role
GRANT SELECT, INSERT, UPDATE ON CUSTOMERS TO loyalty_app_role;
GRANT SELECT, INSERT, UPDATE ON USERS TO loyalty_app_role;
GRANT SELECT, INSERT, UPDATE ON STORES TO loyalty_app_role;
GRANT SELECT, INSERT, UPDATE ON REWARDS TO loyalty_app_role;
GRANT SELECT, INSERT, UPDATE ON TRANSACTIONS TO loyalty_app_role;
GRANT SELECT, INSERT, UPDATE ON QR_SCAN_LOGS TO loyalty_app_role;
GRANT SELECT, INSERT, UPDATE ON CAMPAIGNS TO loyalty_app_role;
GRANT SELECT ON VW_CUSTOMER_SUMMARY TO loyalty_app_role;
GRANT SELECT ON VW_STORE_ANALYTICS TO loyalty_app_role;
GRANT EXECUTE ON SP_ProcessQRRedemption TO loyalty_app_role;
GRANT EXECUTE ON SP_AddCustomerPoints TO loyalty_app_role;

-- Grant read-only permissions
GRANT SELECT ON CUSTOMERS TO loyalty_readonly_role;
GRANT SELECT ON STORES TO loyalty_readonly_role;
GRANT SELECT ON REWARDS TO loyalty_readonly_role;
GRANT SELECT ON TRANSACTIONS TO loyalty_readonly_role;
GRANT SELECT ON QR_SCAN_LOGS TO loyalty_readonly_role;
GRANT SELECT ON VW_CUSTOMER_SUMMARY TO loyalty_readonly_role;
GRANT SELECT ON VW_STORE_ANALYTICS TO loyalty_readonly_role;

GO

-- ========================================================
-- 🔥 PART 10: INTEGRATION NOTES FOR FASTAPI + SQLALCHEMY
-- ========================================================

/*
SQLALCHEMY INTEGRATION NOTES:

1. Connection String Format:
   mssql+pyodbc://username:password@server/LoyaltyDB?driver=ODBC+Driver+17+for+SQL+Server

2. Model Mapping:
   - Use IDENTITY columns for auto-incrementing primary keys
   - Map NVARCHAR to String with appropriate length
   - Map DATETIME2 to DateTime with timezone=True
   - Map BIT to Boolean
   - Use Enum for CHECK constraints (tier, role, status, type)

3. Recommended SQLAlchemy Settings:
   - pool_pre_ping=True (for connection health checks)
   - pool_recycle=300 (5 minutes)
   - echo=False (in production)

4. Transaction Management:
   - Use SQLAlchemy sessions for transaction management
   - Implement proper rollback on errors
   - Use stored procedures for complex operations

5. Performance Considerations:
   - Use lazy loading for relationships
   - Implement pagination for large result sets
   - Use indexes for frequently queried columns
   - Consider read replicas for analytics queries

6. Security:
   - Use parameterized queries (SQLAlchemy handles this)
   - Implement proper authentication and authorization
   - Use connection pooling with limited connections
   - Encrypt sensitive data in transit and at rest
*/

PRINT 'LoyaltyDB database schema created successfully!';
PRINT 'Tables created: CUSTOMERS, USERS, STORES, REWARDS, TRANSACTIONS, QR_SCAN_LOGS, CAMPAIGNS';
PRINT 'Views created: VW_CUSTOMER_SUMMARY, VW_STORE_ANALYTICS';
PRINT 'Stored Procedures: SP_ProcessQRRedemption, SP_AddCustomerPoints';
PRINT 'Sample data inserted for testing';
PRINT 'Ready for FastAPI + SQLAlchemy integration!';

GO
