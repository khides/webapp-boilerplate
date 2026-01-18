# VPC for RDS access (only created when enable_rds = true)

resource "aws_vpc" "main" {
  count = var.enable_rds ? 1 : 0

  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  count = var.enable_rds ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-igw"
  })
}

# Private subnets for RDS (at least 2 AZs required)
resource "aws_subnet" "private" {
  count = var.enable_rds ? length(var.availability_zones) : 0

  vpc_id            = aws_vpc.main[0].id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = var.availability_zones[count.index]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-${count.index + 1}"
    Type = "private"
  })
}

# Security group for Lambda to access RDS
resource "aws_security_group" "lambda" {
  count = var.enable_rds ? 1 : 0

  name_prefix = "${local.name_prefix}-lambda-"
  description = "Security group for Lambda functions"
  vpc_id      = aws_vpc.main[0].id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-lambda-sg"
  })
}

# Security group for RDS
resource "aws_security_group" "rds" {
  count = var.enable_rds ? 1 : 0

  name_prefix = "${local.name_prefix}-rds-"
  description = "Security group for RDS MySQL"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    description     = "MySQL from Lambda"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda[0].id]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-sg"
  })
}

# DB subnet group
resource "aws_db_subnet_group" "main" {
  count = var.enable_rds ? 1 : 0

  name       = "${local.name_prefix}-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-subnet-group"
  })
}
