import { App } from 'cdk8s'
import { SmokePingChart } from './services/smoke-ping'
import { MetalLbChart } from './metallb'

const app = new App()

new MetalLbChart(app, 'metallb')
new SmokePingChart(app, 'smoke-ping')

app.synth()
