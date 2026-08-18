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

        stage('Docker Build') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Docker Deploy') {
            steps {
                bat '''
                docker compose down --remove-orphans
                docker compose up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                bat 'curl.exe -f http://localhost:3101'
                bat 'curl.exe -f http://localhost:4101/health'
                bat 'curl.exe -f http://localhost:4102/health'
                bat 'curl.exe -f http://localhost:4103/health'
            }
        }

        stage('Monitoring & Logs') {
            steps {
                bat 'docker compose ps'
                bat 'docker compose logs --tail=30'
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Deployment failed. Cleaning up failed deployment...'
            bat '''
            docker compose down --remove-orphans
            '''
        }
    }
}
