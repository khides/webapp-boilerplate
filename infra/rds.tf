# RDS MySQL instance (only created when enable_rds = true)

resource "aws_db_instance" "main" {
  count = var.enable_rds ? 1 : 0

  identifier = "${local.name_prefix}-mysql"

  # Engine configuration
  engine               = "mysql"
  engine_version       = var.rds_engine_version
  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true

  # Database configuration
  db_name  = var.rds_database_name
  username = var.rds_master_username
  password = random_password.rds_password[0].result
  port     = 3306

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main[0].name
  vpc_security_group_ids = [aws_security_group.rds[0].id]
  publicly_accessible    = false
  multi_az               = var.environment == "prod"

  # Backup configuration
  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Performance and monitoring
  performance_insights_enabled = var.environment == "prod"
  monitoring_interval          = var.environment == "prod" ? 60 : 0
  monitoring_role_arn          = var.environment == "prod" ? aws_iam_role.rds_monitoring[0].arn : null

  # Parameter group for MySQL 8.0
  parameter_group_name = aws_db_parameter_group.main[0].name

  # Deletion protection
  deletion_protection = var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${local.name_prefix}-final-snapshot" : null

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-mysql"
  })
}

# RDS parameter group
resource "aws_db_parameter_group" "main" {
  count = var.enable_rds ? 1 : 0

  name   = "${local.name_prefix}-mysql-params"
  family = "mysql8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "max_connections"
    value = "100"
  }

  tags = local.common_tags
}

# Random password for RDS
resource "random_password" "rds_password" {
  count = var.enable_rds ? 1 : 0

  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# IAM role for RDS enhanced monitoring (production only)
resource "aws_iam_role" "rds_monitoring" {
  count = var.enable_rds && var.environment == "prod" ? 1 : 0

  name = "${local.name_prefix}-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count = var.enable_rds && var.environment == "prod" ? 1 : 0

  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
