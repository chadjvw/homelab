import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { HelmChart } from '../imports/helm.cattle.io'

export class MetalLbChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    // const namespace = new Namespace(this, 'namespace', {
    //   metadata: {
    //     labels: {
    //       'pod-security.kubernetes.io/audit': 'privileged',
    //       'pod-security.kubernetes.io/enforce': 'privileged',
    //       'pod-security.kubernetes.io/warn': 'privileged',
    //     },
    //     name: 'metallb-system',
    //   },
    // })

    // const metallb = new Helm(this, 'redis', {
    //     chart: 'metallb',
    //     repo: 'https://metallb.github.io/metallb',
    //     namespace: ''
    //   });

    new HelmChart(this, 'helm-chart', {
      metadata: {
        namespace: 'kube-system',
      },
      spec: {
        repo: 'https://metallb.github.io/metallb',
        chart: 'metallb',
        targetNamespace: 'metallb-system',
      },
    })
  }
}
