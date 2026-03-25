From postgres:latest

# Install necessary packages for pg_stat_statements
WORKDIR /app

# Expose PostgreSQL default port
EXPOSE 5432

# Start PostgreSQL serverand enable pg_stat_statements
CMD ["postgres", "-c", "shared_preload_libraries=pg_stat_statements", "-c", "pg_stat_statements.track=all"]

