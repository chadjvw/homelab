import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { Application } from '../imports/argoproj.io'

export class ArgoCDChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new Application(this, 'name', {
      metadata: {
        name: '',
      },
      spec: {
        project: 'default',
        destination: {},
      },
    })
  }
}
