-- database_schema
-- 1. جدول المستخدمين (Users)

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('individual', 'organization', 'admin')),
    phone VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Yemen',
    language VARCHAR(10) DEFAULT 'ar',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول الملفات الشخصية (Profiles)

CREATE TABLE Profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    occupation VARCHAR(100),
    monthly_income DECIMAL(12,2),
    monthly_expenses DECIMAL(12,2),
    savings DECIMAL(12,2),
    debts DECIMAL(12,2),
    smoking_status BOOLEAN DEFAULT FALSE,
    health_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول المنظمات (Organizations)

CREATE TABLE Organizations (
    org_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    org_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    employee_count INTEGER,
    total_budget DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول أنواع التأمين (Insurance_Types)

CREATE TABLE Insurance_Types (
    type_id SERIAL PRIMARY KEY,
    type_code VARCHAR(20) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    type_name_ar VARCHAR(100),
    category VARCHAR(20) NOT NULL CHECK (category IN ('health', 'car', 'property', 'life')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. جدول خطط التأمين (Insurance_Plans)

CREATE TABLE Insurance_Plans (
    plan_id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL REFERENCES Insurance_Types(type_id),
    plan_code VARCHAR(10) NOT NULL UNIQUE,
    plan_name VARCHAR(100) NOT NULL,
    plan_name_ar VARCHAR(100),
    description TEXT,
    target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('individual', 'organization', 'both')),
    <!--  إعدادات عامة -->
    card_issuance_fee DECIMAL(5,2) DEFAULT 3.00,
    lost_card_fee DECIMAL(5,2) DEFAULT 5.00,
    payment_method VARCHAR(50) DEFAULT 'advance_monthly',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. جدول فئات العمر للتأمين الصحي (Health_Age_Bands)

CREATE TABLE Health_Age_Bands (
    age_band_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    premium_rate DECIMAL(10,2) NOT NULL,
    family_coverage_required BOOLEAN DEFAULT TRUE,
    min_children_ratio DECIMAL(5,2) DEFAULT 1.0,
    min_parents_ratio DECIMAL(5,2) DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. جدول الموظفين (Employees)

CREATE TABLE Employees (
    emp_id SERIAL PRIMARY KEY,
    org_id INTEGER NOT NULL REFERENCES Organizations(org_id) ON DELETE CASCADE,
    insurance_plan_id INTEGER REFERENCES Insurance_Plans(plan_id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 100),
    salary DECIMAL(10,2) NOT NULL CHECK (salary > 0),
    dependents_count INTEGER DEFAULT 0 CHECK (dependents_count >= 0),
    health_status VARCHAR(20) CHECK (health_status IN ('excellent', 'good', 'fair', 'poor')),
    job_title VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    has_family_coverage BOOLEAN DEFAULT FALSE,
    enrollment_date DATE,
    coverage_status VARCHAR(20) DEFAULT 'active' CHECK (coverage_status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. جدول المعالين (Dependents)

CREATE TABLE Dependents (
    dependent_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES Employees(emp_id) ON DELETE CASCADE,
    dependent_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('spouse', 'child', 'parent')),
    date_of_birth DATE NOT NULL,
    age INTEGER,
    is_student BOOLEAN DEFAULT FALSE,
    coverage_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. جدول التغطيات الصحية (Health_Coverages)

CREATE TABLE Health_Coverages (
    coverage_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    benefit_category VARCHAR(50) NOT NULL CHECK (benefit_category IN ('inpatient', 'outpatient', 'maternity', 'additional')),
    benefit_type VARCHAR(100) NOT NULL,
    benefit_type_ar VARCHAR(100),
    coverage_limit DECIMAL(12,2),
    limit_per_case DECIMAL(12,2),
    co_insurance_rate DECIMAL(5,2),
    coverage_notes TEXT,
    coverage_notes_ar TEXT,
    is_covered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. جدول التغطيات الإضافية الصحية (Health_Additional_Benefits)

CREATE TABLE Health_Additional_Benefits (
    additional_benefit_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    benefit_name VARCHAR(100) NOT NULL,
    benefit_name_ar VARCHAR(100),
    coverage_limit DECIMAL(10,2),
    frequency VARCHAR(50),
    conditions TEXT,
    conditions_ar TEXT,
    is_covered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. جدول استثناءات التأمين الصحي (Health_Exclusions)

CREATE TABLE Health_Exclusions (
    exclusion_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    exclusion_description TEXT NOT NULL,
    exclusion_description_ar TEXT,
    exclusion_category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. جدول المركبات (Vehicles)

CREATE TABLE Vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    -- المعلومات الأساسية
    plate_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(30),
    chassis_number VARCHAR(100) UNIQUE,
    engine_number VARCHAR(100),
    -- المعلومات الفنية
    seating_capacity INTEGER NOT NULL,
    weight DECIMAL(8,2),
    load_capacity DECIMAL(8,2),
    purpose VARCHAR(100),
    -- القيمة والتأمين
    estimated_value DECIMAL(12,2) NOT NULL,
    current_market_value DECIMAL(12,2),
    -- حالة المركبة
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'sold')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. جدول تغطيات تأمين السيارات (Car_Coverages)

CREATE TABLE Car_Coverages (
    coverage_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    coverage_type VARCHAR(50) NOT NULL CHECK (coverage_type IN ('comprehensive', 'liability', 'additional')),
    coverage_name VARCHAR(100) NOT NULL,
    coverage_name_ar VARCHAR(100),
    coverage_description TEXT,
    coverage_description_ar TEXT,
    coverage_limit DECIMAL(12,2),
    deductible DECIMAL(10,2) DEFAULT 0.00,
    is_covered BOOLEAN DEFAULT TRUE,
    conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. جدول استثناءات تأمين السيارات (Car_Exclusions)

CREATE TABLE Car_Exclusions (
    exclusion_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    exclusion_type VARCHAR(50) CHECK (exclusion_type IN ('general', 'comprehensive', 'liability')),
    exclusion_description TEXT NOT NULL,
    exclusion_description_ar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. جدول حوادث السيارات (Car_Accidents)

CREATE TABLE Car_Accidents (
    accident_id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE,
    policy_id INTEGER REFERENCES Policies(policy_id),
    -- معلومات الحادث
    accident_date TIMESTAMP NOT NULL,
    accident_location TEXT NOT NULL,
    accident_description TEXT,
    police_report_number VARCHAR(100),
    police_station VARCHAR(100),
    -- تفاصيل الحادث
    accident_type VARCHAR(50) CHECK (accident_type IN ('collision', 'theft', 'fire', 'vandalism', 'natural_disaster', 'other')),
    driver_at_fault BOOLEAN,
    other_party_insurance VARCHAR(100),
    -- حالة المطالبة
    claim_status VARCHAR(20) DEFAULT 'reported' CHECK (claim_status IN ('reported', 'under_investigation', 'approved', 'rejected', 'paid')),
    estimated_damage DECIMAL(12,2),
    final_settlement DECIMAL(12,2),
    -- معلومات السائق
    driver_name VARCHAR(100),
    driver_license_number VARCHAR(50),
    driver_age INTEGER,
    -- توثيق
    photos JSONB,
    witness_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. جدول مطالبات السيارات (Car_Claims)

CREATE TABLE Car_Claims (
    claim_id SERIAL PRIMARY KEY,
    accident_id INTEGER NOT NULL REFERENCES Car_Accidents(accident_id) ON DELETE CASCADE,
    policy_id INTEGER REFERENCES Policies(policy_id),
    claim_type VARCHAR(50) NOT NULL CHECK (claim_type IN ('vehicle_damage', 'theft', 'third_party', 'medical', 'other')),
    -- تفاصيل المطالبة
    claim_description TEXT NOT NULL,
    claim_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2),
    repair_estimate DECIMAL(12,2),
    actual_repair_cost DECIMAL(12,2),
    -- استهلاك القطع
    depreciation_rate DECIMAL(5,2),
    depreciation_amount DECIMAL(10,2),
    -- حالة المطالبة
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'paid')),
    settlement_date DATE,
    -- معلومات الإصلاح
    repair_shop VARCHAR(100),
    repair_start_date DATE,
    repair_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. جدول الأطراف الثالثة (Third_Parties)

CREATE TABLE Third_Parties (
    third_party_id SERIAL PRIMARY KEY,
    accident_id INTEGER NOT NULL REFERENCES Car_Accidents(accident_id) ON DELETE CASCADE,
    -- معلومات الطرف الثالث
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    id_number VARCHAR(50),
    address TEXT,
    insurance_company VARCHAR(100),
    -- الإصابات والمطالبات
    injury_type VARCHAR(50),
    injury_description TEXT,
    medical_expenses DECIMAL(10,2),
    property_damage DECIMAL(10,2),
    -- التسوية
    settlement_offered DECIMAL(10,2),
    settlement_accepted DECIMAL(10,2),
    settlement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. جدول السائقين والركاب (Drivers_Passengers)

CREATE TABLE Drivers_Passengers (
    person_id SERIAL PRIMARY KEY,
    accident_id INTEGER NOT NULL REFERENCES Car_Accidents(accident_id) ON DELETE CASCADE,
    person_type VARCHAR(20) CHECK (person_type IN ('driver', 'passenger')),
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    relationship_to_insured VARCHAR(50),
    -- الإصابات
    injury_type VARCHAR(50),
    injury_description TEXT,
    medical_expenses DECIMAL(10,2),
    -- التعويضات
    compensation_type VARCHAR(50),
    compensation_amount DECIMAL(10,2),
    -- التوثيق
    medical_reports JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. جدول أسعار تأمين السيارات (Car_Premium_Rates)

CREATE TABLE Car_Premium_Rates (
    rate_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50),
    vehicle_age_from INTEGER,
    vehicle_age_to INTEGER,
    estimated_value_from DECIMAL(12,2),
    estimated_value_to DECIMAL(12,2),
    base_premium_rate DECIMAL(5,4),
    min_premium DECIMAL(10,2),
    max_premium DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. جدول فترات التأمين قصيرة الأجل (Short_Term_Rates)

CREATE TABLE Short_Term_Rates (
    rate_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id) ON DELETE CASCADE,
    duration_days INTEGER NOT NULL,
    duration_label VARCHAR(50),
    percentage_of_annual DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. جدول الاستهلاك (Depreciation_Rates)

CREATE TABLE Depreciation_Rates (
    depreciation_id SERIAL PRIMARY KEY,
    vehicle_age_from INTEGER NOT NULL,
    vehicle_age_to INTEGER NOT NULL,
    depreciation_rate DECIMAL(5,2) NOT NULL,
    description VARCHAR(100),
    description_ar VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. جدول جلسات الحساب (Calculation_Sessions)

CREATE TABLE Calculation_Sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    org_id INTEGER REFERENCES Organizations(org_id),
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('individual', 'bulk', 'guest')),
    insurance_type_id INTEGER REFERENCES Insurance_Types(type_id),
    insurance_plan_id INTEGER REFERENCES Insurance_Plans(plan_id),
    input_data JSONB,
    calculated_results JSONB,
    total_employees INTEGER DEFAULT 0,
    total_dependents INTEGER DEFAULT 0,
    total_premium DECIMAL(12,2),
    coverage_percentage DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. جدول الرفعات (Uploads)

CREATE TABLE Uploads (
    upload_id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES Organizations(org_id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    original_name VARCHAR(255),
    file_type VARCHAR(10) CHECK (file_type IN ('csv', 'excel')),
    row_count INTEGER,
    processed_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    error_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- 24. جدول السياسات (Policies)

CREATE TABLE Policies (
    policy_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    org_id INTEGER REFERENCES Organizations(org_id),
    plan_id INTEGER NOT NULL REFERENCES Insurance_Plans(plan_id),
    session_id INTEGER REFERENCES Calculation_Sessions(session_id),
    vehicle_id INTEGER REFERENCES Vehicles(vehicle_id),
    policy_number VARCHAR(50) UNIQUE,
    coverage_amount DECIMAL(12,2),
    premium_amount DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    insurance_duration_days INTEGER DEFAULT 365,
    short_term_rate_id INTEGER REFERENCES Short_Term_Rates(rate_id),
    -- لحقول السيارات
    vehicle_estimated_value DECIMAL(12,2),
    vehicle_current_value DECIMAL(12,2),
    comprehensive_coverage BOOLEAN DEFAULT FALSE,
    third_party_coverage BOOLEAN DEFAULT FALSE,
    driver_passenger_coverage BOOLEAN DEFAULT FALSE,
    -- حالة السياسة
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'pending', 'active', 'expired', 'cancelled')),
    payment_frequency VARCHAR(20) CHECK (payment_frequency IN ('monthly', 'quarterly', 'yearly')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. جدول المطالبات (Claims)

CREATE TABLE Claims (
    claim_id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES Policies(policy_id),
    employee_id INTEGER REFERENCES Employees(emp_id),
    dependent_id INTEGER REFERENCES Dependents(dependent_id),
    claim_type VARCHAR(50) NOT NULL,
    claim_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2),
    service_date DATE NOT NULL,
    claim_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    co_insurance_paid DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 26. جدول التقارير (Reports)

CREATE TABLE Reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    org_id INTEGER REFERENCES Organizations(org_id),
    session_id INTEGER REFERENCES Calculation_Sessions(session_id),
    report_type VARCHAR(20) CHECK (report_type IN ('individual', 'bulk', 'comparison', 'admin')),
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    file_format VARCHAR(10) CHECK (file_format IN ('pdf', 'excel', 'html')),
    file_size INTEGER,
    language VARCHAR(10) DEFAULT 'ar',
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27. جدول الإعدادات (Settings)

CREATE TABLE Settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. جدول السجلات (Logs)

CREATE TABLE Logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- الفهرس والقيود

-- فهارس لتحسين الأداء
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_type ON Users(user_type);
CREATE INDEX idx_employees_org_id ON Employees(org_id);
CREATE INDEX idx_employees_plan_id ON Employees(insurance_plan_id);
CREATE INDEX idx_dependents_employee_id ON Dependents(employee_id);
CREATE INDEX idx_vehicles_user_id ON Vehicles(user_id);
CREATE INDEX idx_vehicles_plate ON Vehicles(plate_number);
CREATE INDEX idx_accidents_vehicle_id ON Car_Accidents(vehicle_id);
CREATE INDEX idx_accidents_date ON Car_Accidents(accident_date);
CREATE INDEX idx_car_claims_accident_id ON Car_Claims(accident_id);
CREATE INDEX idx_policies_user_id ON Policies(user_id);
CREATE INDEX idx_policies_org_id ON Policies(org_id);
CREATE INDEX idx_policies_vehicle_id ON Policies(vehicle_id);
CREATE INDEX idx_claims_policy_id ON Claims(policy_id);
CREATE INDEX idx_sessions_user_id ON Calculation_Sessions(user_id);
CREATE INDEX idx_sessions_org_id ON Calculation_Sessions(org_id);

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers للتحديث التلقائي
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON Profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON Organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON Vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accidents_updated_at BEFORE UPDATE ON Car_Accidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_car_claims_updated_at BEFORE UPDATE ON Car_Claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON Policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON Claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON Settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- بيانات أولية

-- إدخال أنواع التأمين
INSERT INTO Insurance_Types (type_code, type_name, type_name_ar, category) VALUES
('health', 'Health Insurance', 'التأمين الصحي', 'health'),
('car_comprehensive', 'Car Comprehensive Insurance', 'تأمين مركبات شامل', 'car'),
('car_liability', 'Car Third Party Liability', 'تأمين مركبات ضد المسؤولية المدنية', 'car');

-- إدخال خطط التأمين الصحي
INSERT INTO Insurance_Plans (type_id, plan_code, plan_name, plan_name_ar, target_audience) VALUES
(1, 'A', 'First Class - Staff and Families', 'الدرجة الأولى - الموظفين والعوائل', 'organization'),
(1, 'B', 'First Class - Staff Only', 'الدرجة الأولى - الموظفين فقط', 'organization'),
(1, 'C', 'First Class - Staff and Families (Economy)', 'الدرجة الأولى - الموظفين والعوائل (اقتصادي)', 'organization');

-- إدخال خطط تأمين السيارات
INSERT INTO Insurance_Plans (type_id, plan_code, plan_name, plan_name_ar, target_audience) VALUES
(2, 'COMP', 'Comprehensive Car Insurance', 'تأمين مركبات شامل', 'individual'),
(3, 'LIAB', 'Third Party Liability', 'تأمين ضد المسؤولية المدنية', 'individual');

-- إدخال فئات العمر للتأمين الصحي
INSERT INTO Health_Age_Bands (plan_id, min_age, max_age, premium_rate) VALUES
(1, 0, 65, 350.00), (2, 18, 65, 280.00), (3, 0, 65, 250.00);

-- إدخال تغطيات تأمين السيارات
INSERT INTO Car_Coverages (plan_id, coverage_type, coverage_name, coverage_name_ar, is_covered) VALUES
(4, 'comprehensive', 'Vehicle Loss or Damage', 'الفقد او التلف للمركبة المؤمنة', true),
(4, 'comprehensive', 'Theft Coverage', 'التغطية ضد السرقة', true),
(4, 'liability', 'Third Party Bodily Injury', 'إصابات الطرف الثالث', true),
(4, 'liability', 'Third Party Property Damage', 'أضرار ممتلكات الطرف الثالث', true);

-- إدخال فترات التأمين قصيرة الأجل
INSERT INTO Short_Term_Rates (plan_id, duration_days, duration_label, percentage_of_annual) VALUES
(4, 15, '15 يومًا', 12.5), (4, 30, 'شهر واحد', 25.0), (4, 60, 'شهرين', 37.5),
(4, 90, 'ثلاثة شهور', 50.0), (4, 120, 'أربعة شهور', 60.0), (4, 150, 'خمسة شهور', 70.0),
(4, 180, 'ستة شهور', 75.0), (4, 210, 'سبعة أشهر', 80.0), (4, 240, 'ثمانية أشهر', 85.0);

-- إدخال جداول الاستهلاك
INSERT INTO Depreciation_Rates (vehicle_age_from, vehicle_age_to, depreciation_rate, description_ar) VALUES
(0, 1, 10.0, 'لغاية سنة واحدة'), (1, 2, 15.0, 'لغاية سنتين'),
(2, 3, 20.0, 'لغاية 3 سنوات'), (3, 4, 25.0, 'لغاية 4 سنوات'),
(4, 5, 30.0, 'لغاية 5 سنوات'), (5, 6, 35.0, 'لغاية 6 سنوات'),
(6, 7, 40.0, 'لغاية 7 سنوات'), (7, 8, 45.0, 'لغاية 8 سنوات'),
(8, 999, 50.0, 'لغاية 9 سنوات فأكثر');

-- إدخال إعدادات النظام
INSERT INTO Settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'SafeRatio', 'string', 'اسم الشركة'),
('default_language', 'ar', 'string', 'اللغة الافتراضية'),
('max_upload_size', '10485760', 'number', 'الحجم الأقصى للرفع بالبايت'),
('session_timeout', '30', 'number', 'مهلة الجلسة بالدقائق');