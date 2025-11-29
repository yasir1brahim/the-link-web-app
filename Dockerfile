# Multi-stage build for React app
# Stage 1: Build the React app
FROM node:18.20.5-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Apache
FROM httpd:2.4-alpine

# Copy built files from builder stage
COPY --from=builder /app/build/ /usr/local/apache2/htdocs/

# Enable mod_rewrite for React Router
RUN sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/g' /usr/local/apache2/conf/httpd.conf

# Create .htaccess for React Router
RUN echo '<IfModule mod_rewrite.c>' > /usr/local/apache2/htdocs/.htaccess && \
    echo '  RewriteEngine On' >> /usr/local/apache2/htdocs/.htaccess && \
    echo '  RewriteBase /' >> /usr/local/apache2/htdocs/.htaccess && \
    echo '  RewriteRule ^index\.html$ - [L]' >> /usr/local/apache2/htdocs/.htaccess && \
    echo '  RewriteCond %{REQUEST_FILENAME} !-f' >> /usr/local/apache2/htdocs/.htaccess && \
    echo '  RewriteCond %{REQUEST_FILENAME} !-d' >> /usr/local/apache2/htdocs/.htaccess && \
    echo '  RewriteRule . /index.html [L]' >> /usr/local/apache2/htdocs/.htaccess && \
    echo '</IfModule>' >> /usr/local/apache2/htdocs/.htaccess

EXPOSE 80

CMD ["httpd", "-D", "FOREGROUND"]
