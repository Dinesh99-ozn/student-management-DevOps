pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('EC2 Connection Test') {
            steps {
                sshagent(credentials: ['ec2-deploy-key']) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no ec2-user@51.21.224.44 "echo EC2-JENKINS-SSH-OK"
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'cd services\\auth-service && npm install'
                bat 'cd services\\student-service && npm install'
                bat 'cd services\\academic-service && npm install'
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Auth Tests') {
                    steps {
                        bat 'cd services\\auth-service && npm test -- --runInBand'
                    }
                }

                stage('Student Tests') {
                    steps {
                        bat 'cd services\\student-service && npm test -- --runInBand'
                    }
                }

                stage('Academic Tests') {
                    steps {
                        bat 'cd services\\academic-service && npm test -- --runInBand'
                    }
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                sshagent(credentials: ['ec2-deploy-key']) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no ec2-user@51.21.224.44 "mkdir -p /home/ec2-user/student-management"

                    scp -o StrictHostKeyChecking=no -r database services frontend docker-compose.yml docker-compose.rollback.yml README.md Jenkinsfile ec2-user@51.21.224.44:/home/ec2-user/student-management/

                    ssh -o StrictHostKeyChecking=no ec2-user@51.21.224.44 "cd /home/ec2-user/student-management && docker compose build && docker compose up -d"
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sshagent(credentials: ['ec2-deploy-key']) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no ec2-user@51.21.224.44 "cd /home/ec2-user/student-management && docker compose ps && curl -f http://localhost:4201/health && curl -f http://localhost:4202/health && curl -f http://localhost:4203/health"
                    '''
                }
            }
        }

        stage('Monitoring & Logs') {
            steps {
                sshagent(credentials: ['ec2-deploy-key']) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no ec2-user@51.21.224.44 "cd /home/ec2-user/student-management && docker compose ps && docker compose logs --tail=30"
                    '''
                }
            }
        }
    }

    post {

        success {
            echo 'CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Deployment failed. Starting rollback on AWS EC2...'

            sshagent(credentials: ['ec2-deploy-key']) {
                bat '''
                ssh -o StrictHostKeyChecking=no ec2-user@51.21.224.44 "cd /home/ec2-user/student-management && docker compose down --remove-orphans && docker compose up -d"
                '''
            }
        }
    }
}