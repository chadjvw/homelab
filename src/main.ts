import { App } from 'cdk8s'
import { SmokePingChart } from './services/smoke-ping'

const app = new App()

new SmokePingChart(app, 'smoke-ping')

app.synth()
