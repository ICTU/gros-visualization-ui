pipeline {
    agent { label 'docker' }

    environment {
        GITLAB_TOKEN = credentials('visualization-ui-gitlab-token')
    }

    options {
        gitLabConnection('gitlab')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    triggers {
        gitlab(triggerOnPush: true, triggerOnMergeRequest: true, branchFilterType: 'All', secretToken: env.GITLAB_TOKEN)
    }

    post {
        failure {
            updateGitlabCommitStatus name: env.JOB_NAME, state: 'failed'
        }
        aborted {
            updateGitlabCommitStatus name: env.JOB_NAME, state: 'canceled'
        }
    }

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:6'
                    reuseNode true
                }
            }
            steps {
                updateGitlabCommitStatus name: env.JOB_NAME, state: 'running'
                sh 'npm install .'
            }
        }
        stage('Push') {
            when { branch 'master' }
            agent {
                docker {
                    image 'node:6'
                    reuseNode true
                }
            }
            steps {
                sh 'npm publish --registry $NPM_REGISTRY'
            }
        }
        stage('Status') {
            steps {
                updateGitlabCommitStatus name: env.JOB_NAME, state: 'success'
            }
        }
    }
}
