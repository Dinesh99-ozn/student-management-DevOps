pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                // Get the latest code from Git
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install dependencies for each microservice
                bat 'cd services\\auth-service && npm install'
                bat 'cd services\\student-service && npm install'
                bat 'cd services\\academic-service && npm install'
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Auth Tests') {
                    steps {
                        // Test authentication service
                        bat 'cd services\\auth-service && npm test -- --runInBand'
                    }
                }

                stage('Student Tests') {
                    steps {
                        // Test student service
                        bat 'cd services\\student-service && npm test -- --runInBand'
                    }
                }

                stage('Academic Tests') {
                    steps {
                        // Test academic service
                        bat 'cd services\\academic-service && npm test -- --runInBand'
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                // Build all application Docker images
                bat 'docker compose build'
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }

        failure {
            echo 'CI pipeline failed. Check the test/build logs.'
        }
    }
}