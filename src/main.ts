import { App } from 'cdk8s'
import { SmokePingChart } from './services/smoke-ping'
import { MetalLbChart } from './metallb'
import { ArgoCDChart } from './argocd'
import { JackettChart } from './services/jackett'

const app = new App()

const argocd = new ArgoCDChart(app, 'argocd')

const metalConfig = new MetalLbChart(app, 'metallb-config')

metalConfig.addDependency(argocd)

new SmokePingChart(app, 'smoke-ping')
new JackettChart(app, 'jackett')

app.synth()
