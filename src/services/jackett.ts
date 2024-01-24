import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { Deployment, EnvValue, HostPathVolumeType, ServiceType, Volume } from 'cdk8s-plus-27'

export class JackettChart extends Chart {
  constructor(scope: Construct, appLabel: string) {
    super(scope, appLabel)

    const deployment = new Deployment(this, 'app-container', {
      replicas: 1,
    })

    const configVolume = Volume.fromHostPath(this, 'config-volume', 'config', {
      path: '/opt/jackett',
      type: HostPathVolumeType.DIRECTORY,
    })

    deployment.addContainer({
      image: 'ghcr.io/linuxserver/jackett',
      portNumber: 9117,
      envVariables: {
        PUID: EnvValue.fromValue('583'),
        PGID: EnvValue.fromValue('583'),
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
      ],
    })

    deployment.exposeViaService({
      name: 'jackett',
      serviceType: ServiceType.LOAD_BALANCER,
    })
  }
}
