pipeline {
    environment {
        registry = "repo.hbt.de:442/pwr/report-service"
        registryCredential = 'nexus-pwr-deploy'
    }
    agent any

    tools {
        maven 'Maven 3.5.0'
        jdk 'JDK8'
    }
    stages {
        stage ('Initialize') {
            steps {
                sh '''
                    echo "branch = ${GIT_BRANCH##origin/}"
                    echo "PATH = ${PATH}"
                    echo "M2_HOME = ${M2_HOME}"
                '''
            }
        }
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                dir('discovery') {
                    sh "mvn package"
                    script {
                        dockerImage = docker.build registry + ':' + '${GIT_BRANCH##origin/}'
                    }
                }
            }
        }
        stage ('Push Image') {
             steps {
                script {
                    docker.withRegistry('https://repo.hbt.de:442', registryCredential ) {
                        dockerImage.push()
                    }
                }
             }
        }
        stage('Trigger Deployment') {
            steps {
                script {
                    build job: 'pwr_build/pwr-report-service_deploy', wait: false
                }
            }
        }
    }
}
