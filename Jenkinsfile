pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
                bat 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                bat 'curl.exe -f http://localhost:3002'
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
            echo 'Pipeline failed. Check the logs.'
        }
    }
}