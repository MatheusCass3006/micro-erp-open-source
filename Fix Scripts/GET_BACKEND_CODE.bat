@echo off
echo Conectando ao servidor para buscar codigo do backend...
ssh -i "C:\Users\Matheus\Downloads\microerp-key.pem" -o StrictHostKeyChecking=no ubuntu@56.124.56.111 "cat /home/ubuntu/microerp/backend/src/modules/auth/authRoutes.ts && echo '---CONTROLLER---' && cat /home/ubuntu/microerp/backend/src/modules/auth/authController.ts && echo '---SERVICE---' && cat /home/ubuntu/microerp/backend/src/modules/auth/authService.ts" > "C:\Users\Matheus\Desktop\Site MicroERP\backend_auth_output.txt" 2>&1
echo Pronto! Verifique o arquivo backend_auth_output.txt
