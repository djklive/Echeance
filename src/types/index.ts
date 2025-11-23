// Types pour les échéances
export interface Echeance {
  id: number
  titre: string
  montant: number
  date: string
  paid: boolean
  owner: string
  created_at: string
  updated_at: string
}

// Type pour créer une nouvelle échéance (sans id, dates)
export interface EcheanceInput {
  titre: string
  montant: number
  date: string
  paid?: boolean
}

