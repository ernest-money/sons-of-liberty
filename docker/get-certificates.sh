#!/bin/bash
# get-certificates.sh - Automatically obtain SSL certificates for ernest.money domains

# Directory to store the certificates
SSL_DIR="./ssl"
DOMAINS=("staging.ernest.money" "app.ernest.money")

# Ensure the SSL directory exists
mkdir -p $SSL_DIR

# Function to map domain to environment name
get_env_name() {
    if [[ "$1" == "staging.ernest.money" ]]; then
        echo "staging"
    elif [[ "$1" == "app.ernest.money" ]]; then
        echo "production"
    else
        echo "unknown"
    fi
}

# For each domain, get or renew certificates
for domain in "${DOMAINS[@]}"; do
    env_name=$(get_env_name "$domain")
    
    if [ "$env_name" == "unknown" ]; then
        echo "Unknown domain: $domain. Skipping."
        continue
    fi
    
    echo "Getting certificates for $domain (environment: $env_name)..."
    
    # Check if we need to obtain new certificates
    if [ ! -f "$SSL_DIR/${env_name}.crt" ] || [ ! -f "$SSL_DIR/${env_name}.key" ]; then
        echo "Certificates not found. Obtaining new certificates..."
        
        # Get the certificate using DNS challenge
        # Note: You'll need to configure authentication for your DNS provider
        # For Cloudflare, create a file at ~/.secrets/certbot/cloudflare.ini with:
        # dns_cloudflare_email = your-email@example.com
        # dns_cloudflare_api_key = your-api-key
        
        certbot certonly --dns-cloudflare \
            --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
            -d $domain \
            --non-interactive \
            --agree-tos \
            --email your-email@example.com \
            --cert-name $domain
            
        # Copy certificates to the SSL directory with environment names
        cp /etc/letsencrypt/live/$domain/fullchain.pem "$SSL_DIR/${env_name}.crt"
        cp /etc/letsencrypt/live/$domain/privkey.pem "$SSL_DIR/${env_name}.key"
        
        echo "Certificates obtained and copied to $SSL_DIR/${env_name}.crt and $SSL_DIR/${env_name}.key"
    else
        echo "Certificates already exist. Checking if renewal is needed..."
        
        # Check certificate expiration (30 days before expiry)
        exp_date=$(openssl x509 -enddate -noout -in "$SSL_DIR/${env_name}.crt" | cut -d= -f2-)
        exp_epoch=$(date -d "$exp_date" +%s)
        now_epoch=$(date +%s)
        days_remaining=$(( (exp_epoch - now_epoch) / 86400 ))
        
        if [ $days_remaining -lt 30 ]; then
            echo "Certificate expires in $days_remaining days. Renewing..."
            
            certbot renew --cert-name $domain
            
            # Copy renewed certificates
            cp /etc/letsencrypt/live/$domain/fullchain.pem "$SSL_DIR/${env_name}.crt"
            cp /etc/letsencrypt/live/$domain/privkey.pem "$SSL_DIR/${env_name}.key"
            
            echo "Certificates renewed and copied to $SSL_DIR/${env_name}.crt and $SSL_DIR/${env_name}.key"
        else
            echo "Certificate for $domain is still valid for $days_remaining days. No renewal needed."
        fi
    fi
done

echo "All certificates have been processed."