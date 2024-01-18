import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { Namespace } from 'cdk8s-plus-27'
import { HelmChart } from '../imports/helm.cattle.io'
import { BgpPeerV1Beta2, IpAddressPool } from '../imports/metallb.io'

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
        annotations: {
          'argocd.argoproj.io/hook': 'PreSync',
        },
      },
    })

    new HelmChart(this, 'helm-chart', {
      metadata: {
        namespace: 'kube-system',
        annotations: {
          'argocd.argoproj.io/hook': 'PreSync',
        },
      },
      spec: {
        repo: 'https://metallb.github.io/metallb',
        chart: 'metallb',
        version: '~0.13.12',
        targetNamespace: 'metallb-system',
      },
    })

    new IpAddressPool(this, 'ip-pool', {
      metadata: {
        namespace: namespace.name,
        annotations: {
          'argocd.argoproj.io/sync-wave': '1',
          'argocd.argoproj.io/sync-options': 'SkipDryRunOnMissingResource=true',
        },
      },
      spec: {
        addresses: ['10.0.2.0-10.0.2.50'],
        avoidBuggyIPs: true,
      },
    })

    new BgpPeerV1Beta2(this, 'bgp-peer', {
      metadata: {
        namespace: namespace.name,
        annotations: {
          'argocd.argoproj.io/sync-wave': '1',
          'argocd.argoproj.io/sync-options': 'SkipDryRunOnMissingResource=true',
        },
      },
      spec: {
        myAsn: 64500,
        peerAsn: 64501,
        peerAddress: '10.0.0.1',
      },
    })
  }
}
