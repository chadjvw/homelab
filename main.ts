import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { KubeDeployment } from './imports/k8s';

class MyChart extends Chart {
  constructor(scope: Construct, appLabel: string, props: ChartProps = {}) {
    super(scope, appLabel);

    // Define a Kubernetes Deployment
    new KubeDeployment(this, 'my-deployment', {
      spec: {
        replicas: 3,
        selector: { matchLabels: { app: appLabel } },
        template: {
          metadata: { labels: { app: appLabel } },
          spec: {
            containers: [
              {
                name: 'app-container',
                image: 'nginx:1.19.10',
                ports: [{ containerPort: 80 }]
              }
            ]
          }
        }
      }
    });
  }
}

const app = new App();
new MyChart(app, 'homelab');
app.synth();
