import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { BgpPeerV1Beta2, IpAddressPool } from '../imports/metallb.io'

export class MetalLbChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new IpAddressPool(this, 'ip-pool', {
      metadata: {
        namespace: 'metallb-system',
        annotations: {
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
        namespace: 'metallb-system',
        annotations: {
          'argocd.argoproj.io/sync-options': 'SkipDryRunOnMissingResource=true',
        },
      },
      spec: {
        myAsn: 64500,
        peerAsn: 64501,
        peerAddress: '10.0.1.1',
      },
    })
  }
}
