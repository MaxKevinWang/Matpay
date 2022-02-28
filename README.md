# MatPay

A payment split system based on Matrix.

## Installation

### Container-based Installation

Install docker or podman on your target server. The image is currently hosted on a private container registry.

```bash
# alias docker=podman
docker pull --tls-verify=false oracle-arm.woosoft.win:5000/matpay:latest
```

The image supports mounting custom certificates. Certificates should be mounted to ```/data/certs```, with the private key named ```privkey.pem ```and the certificate file named ```fullchain.pem```. These filenames match the default certificate filenames from Let's Encrypt. If you do not provide custom certificates, a self-signed one will be generated.

The image exposes port 80 for HTTP connections and 443 for HTTPS connections.

```bash
# Custom certificate
docker run -d -p 8080:80 -p 8443:443 -v ./certs:/data/certs:Z --name matpay matpay:latest
# Self-signed or no TLS
docker run -d -p 8080:80 -p 8443:443 --name matpay matpay:latest
```

### Manual Build & Installation

Install Node.js according to your distribution. Also nginx is used here, but any web server should work fine.

Clone the repository and build.

```bash
git clone <repository url>
cd matpay
npm ci
npm run build
```

Add the following file to ```/etc/nginx/conf.d/```. The configuration filename should end with ```.conf```. Change the certificate path to the corresponding paths where certificates are stored.

```nginx
# YOUR_DOMAIN is your domain name
server {
	listen 80;
	listen [::]:80;
	server_name YOUR_DOMAIN;
	return 301 https://YOUR_DOMAIN$request_uri;
}
server {
	listen 443 ssl;
	listen [::]:443 ssl;
	server_name YOUR_DOMAIN;
	root /srv/www/matpay;
	charset UTF-8;
	ssl_certificate     /etc/letsencrypt/live/xxx/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/xxx/privkey.pem;
	ssl_protocols       TLSv1.2 TLSv1.3;
	ssl_ciphers         HIGH:!aNULL:!MD5;
	location / {
  		try_files $uri $uri/ /index.html;
	}
}
```

Copy the files and start nginx.

```bash
sudo mkdir -p /srv/www/matpay
sudo cp -r dist/* /srv/www/matpay
sudo chown -R nginx:nginx /srv/www/matpay # Note: some distros use different nginx username
# SELinux: change directory labels
# semanage fcontext -a -t httpd_sys_content_t '/srv/www(/.*)?'
# restorecon -Rv /srv/www
sudo systemctl enable --now nginx
```


