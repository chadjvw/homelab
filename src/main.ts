import * as kplus from 'cdk8s-plus-27'
import { Construct } from 'constructs'
import { App, Chart } from 'cdk8s'

class MyChart extends Chart {
  constructor(scope: Construct, appLabel: string) {
    super(scope, appLabel)

    new kplus.Deployment(this, 'app-container', {
      replicas: 1,
      containers: [{ image: 'nginx' }],
    })
  }
}

const app = new App()

new MyChart(app, 'homelab')

app.synth()
