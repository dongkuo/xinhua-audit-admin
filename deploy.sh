pnpm run build
zip -r xinhua-audit-admin.zip dist
scp xinhua-audit-admin.zip root@xinhua.cloud:/root/workspace && ssh root@xinhua.cloud "cd /root/workspace && unzip xinhua-audit-admin.zip && rm -rf xinhua-audit-admin.zip && rm -rf xinhua-audit-admin && mv dist xinhua-audit-admin"
