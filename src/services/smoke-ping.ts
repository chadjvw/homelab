import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { Deployment, EnvValue, HostPathVolumeType, ServiceType, Volume } from 'cdk8s-plus-27'

export class SmokePingChart extends Chart {
  constructor(scope: Construct, appLabel: string) {
    super(scope, appLabel)

    const deployment = new Deployment(this, 'app-container', {
      replicas: 1,
    })

    const configVolume = Volume.fromHostPath(this, 'config-volume', 'config', {
      path: '/opt/smokeping/config',
      type: HostPathVolumeType.DIRECTORY,
    })

    const dataVolume = Volume.fromHostPath(this, 'data-volume', 'data', {
      path: '/opt/smokeping/data',
      type: HostPathVolumeType.DIRECTORY,
    })

    deployment.addContainer({
      image: 'ghcr.io/linuxserver/smokeping',
      portNumber: 80,
      envVariables: {
        PUID: EnvValue.fromValue('1000'),
        PGID: EnvValue.fromValue('1000'),
        TZ: EnvValue.fromValue('America/Denver'),
      },
      securityContext: {
        // run as privileged since linuxserver doesnt support rootless mode
        privileged: true,
        readOnlyRootFilesystem: false,
        allowPrivilegeEscalation: true,
        ensureNonRoot: false,
      },
      volumeMounts: [
        {
          volume: configVolume,
          path: '/config',
        },
        {
          volume: dataVolume,
          path: '/data',
        },
      ],
    })

    deployment.exposeViaService({
      name: 'smoke-ping',
      serviceType: ServiceType.LOAD_BALANCER,
    })
  }
}
