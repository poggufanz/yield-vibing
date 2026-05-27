// vis.js Network graph — nodes, edges, real-time status updates

// vis is loaded as UMD global from unpkg CDN in index.html
// window.vis.Network, window.vis.DataSet

const NODE_COLORS = {
  orchestrator: { background: '#c8ff2e', border: '#8fb020', font: { color: '#000' } },
  worker_pending: { background: '#1e1e22', border: '#4a4a55', font: { color: '#8a8a8f' } },
  worker_active: { background: '#3b82f6', border: '#1d4ed8', font: { color: '#fff' } },
  worker_done: { background: '#22c55e', border: '#15803d', font: { color: '#fff' } },
  worker_failed: { background: '#ef4444', border: '#b91c1c', font: { color: '#fff' } },
  vault: { background: '#141416', border: '#6366f1', font: { color: '#e2e2e5' } }
}

export class AgentGraph {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.nodes = new window.vis.DataSet()
    this.edges = new window.vis.DataSet()
    this.network = null
    this.onNodeClickCallback = null
    this._init()
  }

  _init() {
    const options = {
      physics: {
        enabled: true,
        stabilization: { iterations: 100 },
        barnesHut: { gravitationalConstant: -3000, springLength: 150 }
      },
      nodes: {
        shape: 'box',
        borderWidth: 2,
        font: { size: 13, face: 'monospace' },
        shadow: true
      },
      edges: {
        width: 2,
        color: { color: '#4a4a55', highlight: '#c8ff2e' },
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        font: { size: 11, color: '#8a8a8f', align: 'middle' }
      },
      interaction: { hover: true, tooltipDelay: 200 }
    }
    this.network = new window.vis.Network(
      this.container,
      { nodes: this.nodes, edges: this.edges },
      options
    )
    this.network.on('click', params => {
      if (params.nodes.length > 0 && this.onNodeClickCallback) {
        this.onNodeClickCallback(params.nodes[0])
      }
    })
  }

  /** Add orchestrator node. */
  addOrchestrator(id, label) {
    this.nodes.add({
      id,
      label,
      ...NODE_COLORS.orchestrator,
      size: 40
    })
  }

  /** Add worker agent node. */
  addWorker(id, label) {
    this.nodes.add({
      id,
      label,
      ...NODE_COLORS.worker_pending,
      size: 30
    })
  }

  /** Add vault node. */
  addVault(id, label) {
    this.nodes.add({
      id,
      label,
      ...NODE_COLORS.vault,
      size: 25
    })
  }

  /** Add edge between two nodes. */
  addEdge(fromId, toId, label = '') {
    this.edges.add({ from: fromId, to: toId, label })
  }

  /**
   * Update worker node status.
   * @param {string} nodeId
   * @param {'pending'|'active'|'done'|'failed'} status
   */
  setWorkerStatus(nodeId, status) {
    const colors = NODE_COLORS[`worker_${status}`] || NODE_COLORS.worker_pending
    this.nodes.update({ id: nodeId, ...colors })
  }

  /** Highlight edge (flash animation via color). */
  highlightEdge(fromId, toId) {
    const edge = this.edges.get().find(e => e.from === fromId && e.to === toId)
    if (!edge) return
    this.edges.update({ id: edge.id, color: { color: '#c8ff2e' } })
    setTimeout(() => {
      this.edges.update({ id: edge.id, color: { color: '#4a4a55' } })
    }, 800)
  }

  /** Register node click handler. */
  onNodeClick(callback) {
    this.onNodeClickCallback = callback
  }

  /** Reset graph — clear all nodes and edges. */
  reset() {
    this.nodes.clear()
    this.edges.clear()
  }

  /**
   * Build initial graph from strategy plan.
   * Adds: orchestrator → workers → vaults
   * @param {object[]} vaultPlans - [{ agentId, vault, index }]
   */
  buildFromPlan(vaultPlans) {
    this.reset()
    this.addOrchestrator('orchestrator', 'Orchestrator')

    vaultPlans.forEach((plan, i) => {
      const workerId = plan.agentId
      const vaultId = `vault-${i}`
      this.addWorker(workerId, `Worker ${i + 1}`)
      this.addVault(vaultId, `Vault ${i + 1}\n${plan.vault.slice(0, 8)}...`)
      this.addEdge('orchestrator', workerId, 'dispatch')
      this.addEdge(workerId, vaultId, 'deposit')
    })
  }
}
