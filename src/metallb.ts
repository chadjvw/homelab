import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { Namespace } from 'cdk8s-plus-27'
import { HelmChart } from '../imports/helm.cattle.io'

export class MetalLbChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const namespace = new Namespace(this, 'namespace', {
      metadata: {
        labels: {
          'pod-security.kubernetes.io/audit': 'privileged',
          'pod-security.kubernetes.io/enforce': 'privileged',
          'pod-security.kubernetes.io/warn': 'privileged',
        },
        name: 'metallb-system',
      },
    })

    const metallb = new HelmChart(this, 'helm-chart', {
      metadata: {
        namespace: 'kube-system',
      },
      spec: {
        repo: 'https://metallb.github.io/metallb',
        chart: 'metallb',
        version: '~0.13.12',
        targetNamespace: 'metallb-system',
      },
    })

    metallb.node.addDependency(namespace)
  }
}
