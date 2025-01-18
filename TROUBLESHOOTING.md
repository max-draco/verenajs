# Troubleshooting

## Common Issues
### Issue: Server Crashes on Startup
- **Solution**: Check logs for missing environment variables.
  ```bash
  export DATABASE_URL='your-database-url'
  ```

### Issue: API Returning 500 Errors
- **Solution**: Ensure the database schema is up to date.
  ```bash
  npm run migrate
  ```
