import { App } from 'cdk8s'
import { SmokePingChart } from './services/smoke-ping'
import { MetalLbChart } from './metallb'
import { ArgoCDChart } from './argocd'

const app = new App()

new ArgoCDChart(app, 'argocd-app')
new MetalLbChart(app, 'metallb')
new SmokePingChart(app, 'smoke-ping')

app.synth()
