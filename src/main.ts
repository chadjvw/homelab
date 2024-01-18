import { App } from 'cdk8s'
import { SmokePingChart } from './services/smoke-ping'
import { MetalLbChart } from './metallb'
import { ArgoCDChart } from './argocd'

const app = new App()

const argocd = new ArgoCDChart(app, 'argocd')

const metalConfig = new MetalLbChart(app, 'metallb-config')

metalConfig.addDependency(argocd)

new SmokePingChart(app, 'smoke-ping')

app.synth()
