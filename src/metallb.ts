import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { HelmChart } from '../imports/helm.cattle.io'

export class MetalLbChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

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
