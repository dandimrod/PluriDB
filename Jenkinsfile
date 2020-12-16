pipeline {
    agent any
    tools {
        nodejs "node"
    }

    stages {
        stage('Installing dependencies') {
            when {
                expression {
                    env.BRANCH_NAME == 'master'
                }
            }
            steps {
                sh 'npm install'
            }
        }
        stage('Testing') {
            parallel {
                stage('Lint') {
                    steps {
                        echo 'Linting...'
                        catchError {
                            sh 'npm run lint -- -f checkstyle -o eslint.xml'
                        }
                    }
                    post {
                        always {
                            recordIssues enabledForFailure: true, tools: [esLint(pattern: 'eslint.xml')]
                        }
                    }
                }
                stage('Mocha') {
                    steps {
                        echo 'Testing on mocha...'
                        catchError {
                            sh 'npm run test'
                        }
                    }
                    post {
                        always {
                            recordIssues enabledForFailure: true, tools: [junitParser(pattern: 'test-results.xml')]
                        }
                    }
                }
            }
        }
        stage('Publish') {
            when {
                expression {
                    env.BRANCH_NAME == 'main'
                }
            }
            steps {
                withCredentials([
                    [$class: 'UsernamePasswordMultiBinding', credentialsId: 'dandimrod-github',
                        usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD'
                    ]
                ]) {
                    sh 'node index.js build --user $USERNAME --pass $PASSWORD'
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}