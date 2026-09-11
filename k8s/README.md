# IWTC frontend K3s deployment

GitHub Actions publishes the production image to GHCR and updates `deployment.yaml` to the source commit SHA. Argo CD then applies this directory to the `iwtc` namespace.

Register this application after the first image workflow succeeds and the package visibility is Public:

```bash
sudo k3s kubectl apply -f argocd/application.yaml
sudo k3s kubectl -n argocd get application iwtc-frontend
sudo k3s kubectl -n iwtc get pods,svc,ingress,certificate
```
