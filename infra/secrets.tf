# Secrets Manager for RDS credentials (only created when enable_rds = true)

resource "aws_secretsmanager_secret" "rds_credentials" {
  count = var.enable_rds ? 1 : 0

  name        = "${local.name_prefix}/rds/credentials"
  description = "RDS MySQL credentials for ${local.name_prefix}"

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  count = var.enable_rds ? 1 : 0

  secret_id = aws_secretsmanager_secret.rds_credentials[0].id
  secret_string = jsonencode({
    username = var.rds_master_username
    password = random_password.rds_password[0].result
    host     = aws_db_instance.main[0].address
    port     = aws_db_instance.main[0].port
    database = var.rds_database_name
    # Pre-built connection string for convenience
    url = "mysql+aiomysql://${var.rds_master_username}:${urlencode(random_password.rds_password[0].result)}@${aws_db_instance.main[0].address}:${aws_db_instance.main[0].port}/${var.rds_database_name}"
  })
}
