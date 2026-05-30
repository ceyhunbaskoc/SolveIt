pipeline {
    agent any

    environment {
        IMAGE_NAME = 'solveit-backend'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Branch: ${env.BRANCH_NAME ?: 'main'}"
                checkout scm
            }
        }

        stage('Install') {
            steps {
                dir('solveit-backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('solveit-backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ./solveit-backend'
                sh 'docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest'
                echo "Image built: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose up -d --build backend'
                echo 'Backend container güncellendi ve yeniden başlatıldı.'
            }
        }

    }

    post {
        success {
            echo "Pipeline #${env.BUILD_NUMBER} basariyla tamamlandi."
        }
        failure {
            echo "Pipeline #${env.BUILD_NUMBER} basarisiz oldu."
        }
    }
}
