pipeline {
  agent any

  parameters {
    booleanParam(name: 'BUILD_ALL', defaultValue: false, description: 'Force rebuild and redeploy of both frontend and backend')
  }

  environment {
    MINIKUBE_HOME = '/home/ubuntu'
    KUBECONFIG    = '/home/ubuntu/.kube/config'
    NS            = 'event-app'
  }

  stages {
    stage('Detect changes') {
      steps {
        script {
          env.TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          def base = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
          def changed = ''
          if (base && !params.BUILD_ALL) {
            changed = sh(script: "git diff --name-only ${base} HEAD || true", returnStdout: true).trim()
          }
          def all = params.BUILD_ALL || !base || changed == ''
          env.BUILD_FE = (all || changed.split('\n').any { it.startsWith('frontend/') || it.startsWith('k8s/frontend.yaml') }) ? 'true' : 'false'
          env.BUILD_BE = (all || changed.split('\n').any { it.startsWith('backend/') || it.startsWith('k8s/backend.yaml') }) ? 'true' : 'false'
          echo "TAG=${env.TAG} BUILD_FE=${env.BUILD_FE} BUILD_BE=${env.BUILD_BE}"
        }
      }
    }

    stage('Build and deploy') {
      parallel {
        stage('Backend') {
          when { expression { env.BUILD_BE == 'true' } }
          steps {
            sh '''
              set -e
              docker build -t event-backend:${TAG} backend
              minikube image load event-backend:${TAG}
              sed "s|IMAGE_TAG|${TAG}|g" k8s/backend.yaml | kubectl apply -f -
              kubectl -n ${NS} rollout status deployment/backend --timeout=180s
              curl -fsS http://$(minikube ip)/api/health
            '''
          }
          post {
            failure {
              sh 'kubectl -n ${NS} rollout undo deployment/backend || true'
            }
          }
        }
        stage('Frontend') {
          when { expression { env.BUILD_FE == 'true' } }
          steps {
            sh '''
              set -e
              docker build -t event-frontend:${TAG} frontend
              minikube image load event-frontend:${TAG}
              sed "s|IMAGE_TAG|${TAG}|g" k8s/frontend.yaml | kubectl apply -f -
              kubectl -n ${NS} rollout status deployment/frontend --timeout=180s
              curl -fsS -o /dev/null http://$(minikube ip)/login
            '''
          }
          post {
            failure {
              sh 'kubectl -n ${NS} rollout undo deployment/frontend || true'
            }
          }
        }
      }
    }
  }
}
