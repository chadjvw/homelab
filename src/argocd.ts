import { Construct } from 'constructs'
import { App, Chart } from 'cdk8s'
import { Application } from '../imports/argoproj.io'

export class ArgoCDChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const thing = {
      configs: {
        params: {
          'server.insecure': true,
        },
        cmp: {
          create: true,
          plugins: {
            'avp-kustomize': {
              allowConcurrency: true,
              discover: {
                find: {
                  command: ['find', '.', '-name', 'kustomization.yaml'],
                },
              },
              generate: {
                command: ['sh', '-c', 'kustomize build . | argocd-vault-plugin generate --verbose-sensitive-output -'],
              },
              lockRepo: false,
            },
            'avp-helm': {
              allowConcurrency: true,
              discover: {
                find: {
                  command: ['sh', '-c', "find . -name 'Chart.yaml' && find . -name 'values.yaml'"],
                },
              },
              generate: {
                command: [
                  'sh',
                  '-c',
                  'helm template \\$ARGOCD_APP_NAME -n \\$ARGOCD_APP_NAMESPACE -f <(echo "\\$ARGOCD_ENV_helm_values") . |\nargocd-vault-plugin generate --verbose-sensitive-output -\n',
                ],
              },
              lockRepo: false,
            },
            avp: {
              allowConcurrency: true,
              discover: {
                find: {
                  command: ['sh', '-c', 'find . -name \'*.yaml\' | xargs -I {} grep "path" {} | grep .'],
                },
              },
              generate: {
                command: ['argocd-vault-plugin', 'generate', '--verbose-sensitive-output', '.'],
              },
              lockRepo: false,
            },
          },
        },
      },
      repoServer: {
        env: [
          {
            name: 'AVP_TYPE',
            value: 'awssecretsmanager',
          },
        ],
        metrics: {
          enabled: true,
          serviceMonitor: {
            enabled: true,
          },
        },
        serviceAccount: {
          create: false,
          name: 'argocd-repo-server',
        },
        initContainers: [
          {
            name: 'download-tools',
            image: 'alpine:latest',
            command: ['sh', '-c'],
            env: [
              {
                name: 'AVP_VERSION',
                value: '1.14.0',
              },
              {
                name: 'AVP_ARCHITECTURE',
                value: 'arm64',
              },
            ],
            args: [
              'wget -O argocd-vault-plugin https://github.com/argoproj-labs/argocd-vault-plugin/releases/download/v\\${AVP_VERSION}/argocd-vault-plugin_\\${AVP_VERSION}_linux_\\${AVP_ARCHITECTURE} && chmod +x argocd-vault-plugin && mv argocd-vault-plugin /custom-tools/',
            ],
            volumeMounts: [
              {
                mountPath: '/custom-tools',
                name: 'custom-tools',
              },
            ],
          },
        ],
        extraContainers: [
          {
            name: 'avp',
            command: ['/var/run/argocd/argocd-cmp-server'],
            image: 'quay.io/argoproj/argocd:v2.7.2',
            securityContext: {
              runAsNonRoot: true,
              runAsUser: 999,
            },
            volumeMounts: [
              {
                mountPath: '/var/run/argocd',
                name: 'var-files',
              },
              {
                mountPath: '/home/argocd/cmp-server/plugins',
                name: 'plugins',
              },
              {
                mountPath: '/tmp',
                name: 'tmp',
              },
              {
                mountPath: '/home/argocd/cmp-server/config/plugin.yaml',
                subPath: 'avp.yaml',
                name: 'argocd-cmp-cm',
              },
              {
                name: 'custom-tools',
                subPath: 'argocd-vault-plugin',
                mountPath: '/usr/local/bin/argocd-vault-plugin',
              },
            ],
          },
          {
            name: 'avp-helm',
            command: ['/var/run/argocd/argocd-cmp-server'],
            image: 'quay.io/argoproj/argocd:v2.7.2',
            securityContext: {
              runAsNonRoot: true,
              runAsUser: 999,
            },
            volumeMounts: [
              {
                mountPath: '/var/run/argocd',
                name: 'var-files',
              },
              {
                mountPath: '/home/argocd/cmp-server/plugins',
                name: 'plugins',
              },
              {
                mountPath: '/tmp',
                name: 'tmp',
              },
              {
                mountPath: '/home/argocd/cmp-server/config/plugin.yaml',
                subPath: 'avp-helm.yaml',
                name: 'argocd-cmp-cm',
              },
              {
                name: 'custom-tools',
                subPath: 'argocd-vault-plugin',
                mountPath: '/usr/local/bin/argocd-vault-plugin',
              },
            ],
          },
          {
            name: 'avp-kustomize',
            command: ['/var/run/argocd/argocd-cmp-server'],
            image: 'quay.io/argoproj/argocd:v2.7.2',
            securityContext: {
              runAsNonRoot: true,
              runAsUser: 999,
            },
            volumeMounts: [
              {
                mountPath: '/var/run/argocd',
                name: 'var-files',
              },
              {
                mountPath: '/home/argocd/cmp-server/plugins',
                name: 'plugins',
              },
              {
                mountPath: '/tmp',
                name: 'tmp',
              },
              {
                mountPath: '/home/argocd/cmp-server/config/plugin.yaml',
                subPath: 'avp-kustomize.yaml',
                name: 'argocd-cmp-cm',
              },
              {
                name: 'custom-tools',
                subPath: 'argocd-vault-plugin',
                mountPath: '/usr/local/bin/argocd-vault-plugin',
              },
            ],
          },
        ],
        volumes: [
          {
            configMap: {
              name: 'argocd-cmp-cm',
            },
            name: 'argocd-cmp-cm',
          },
          {
            name: 'custom-tools',
            emptyDir: {},
          },
        ],
      },
    }

    new Application(this, 'argocd', {
      metadata: {
        name: 'argocd-helm',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://argoproj.github.io/argo-helm',
          chart: 'argo-cd',
          targetRevision: '~5.53.3',
          helm: {
            valuesObject: {
              server: {
                service: {
                  type: 'LoadBalancer',
                },
              },
              cmp: {
                create: true,
                plugins: {
                  avp: {
                    allowConcurrency: true,
                    discover: {
                      find: {
                        command: ['sh', '-c', 'find . -name \'*.yaml\' | xargs -I {} grep "path" {} | grep .'],
                      },
                    },
                    generate: {
                      command: ['argocd-vault-plugin', 'generate', '--verbose-sensitive-output', '.'],
                    },
                    lockRepo: false,
                  },
                },
              },
              repoServer: {
                env: [
                  {
                    name: 'AVP_TYPE',
                    value: 'awssecretsmanager',
                  },
                  {
                    name: 'AWS_REGION',
                    value: 'us-west-2',
                  },
                ],
                // metrics: {
                //   enabled: true,
                //   serviceMonitor: {
                //     enabled: true,
                //   },
                // },
                // serviceAccount: {
                //   create: false,
                //   name: 'argocd-repo-server',
                // },
                initContainers: [
                  {
                    name: 'download-tools',
                    image: 'alpine:latest',
                    command: ['sh', '-c'],
                    env: [
                      {
                        name: 'AVP_VERSION',
                        value: '1.17.0',
                      },
                      {
                        name: 'AVP_ARCHITECTURE',
                        value: 'arm64',
                      },
                    ],
                    args: [
                      'wget -O argocd-vault-plugin https://github.com/argoproj-labs/argocd-vault-plugin/releases/download/v\\${AVP_VERSION}/argocd-vault-plugin_\\${AVP_VERSION}_linux_\\${AVP_ARCHITECTURE} && chmod +x argocd-vault-plugin && mv argocd-vault-plugin /custom-tools/',
                    ],
                    volumeMounts: [
                      {
                        mountPath: '/custom-tools',
                        name: 'custom-tools',
                      },
                    ],
                  },
                ],
                extraContainers: [
                  {
                    name: 'avp',
                    command: ['/var/run/argocd/argocd-cmp-server'],
                    image: 'quay.io/argoproj/argocd:v2.9.4',
                    securityContext: {
                      runAsNonRoot: true,
                      runAsUser: 999,
                    },
                    volumeMounts: [
                      {
                        mountPath: '/var/run/argocd',
                        name: 'var-files',
                      },
                      {
                        mountPath: '/home/argocd/cmp-server/plugins',
                        name: 'plugins',
                      },
                      {
                        mountPath: '/tmp',
                        name: 'tmp',
                      },
                      {
                        mountPath: '/home/argocd/cmp-server/config/plugin.yaml',
                        subPath: 'avp.yaml',
                        name: 'argocd-cmp-cm',
                      },
                      {
                        name: 'custom-tools',
                        subPath: 'argocd-vault-plugin',
                        mountPath: '/usr/local/bin/argocd-vault-plugin',
                      },
                    ],
                  },
                ],
                volumes: [
                  {
                    configMap: {
                      name: 'argocd-cmp-cm',
                    },
                    name: 'argocd-cmp-cm',
                  },
                  {
                    name: 'custom-tools',
                    emptyDir: {},
                  },
                ],
              },
            },
          },
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'argocd',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })

    new Application(this, 'the-lab', {
      metadata: {
        name: 'the-lab',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://github.com/chadjvw/homelab.git',
          path: 'manifests',
          targetRevision: 'HEAD',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'homelab',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })

    new Application(this, 'metallb', {
      metadata: {
        name: 'metallb',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://metallb.github.io/metallb',
          chart: 'metallb',
          targetRevision: '~0.13.12',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'metallb-system',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })

    new Application(this, 'external-dns', {
      metadata: {
        name: 'external-dns',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://kubernetes-sigs.github.io/external-dns/',
          chart: 'external-dns',
          targetRevision: '~1.14.0',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'external-dns',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })
  }
}
