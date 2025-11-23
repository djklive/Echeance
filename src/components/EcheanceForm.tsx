import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './EcheanceForm.css'

interface Echeance {
  id?: number
  titre: string
  montant: number
  date: string
  paid: boolean
}

interface EcheanceFormProps {
  echeance?: Echeance | null
  onSuccess: () => void
  onCancel: () => void
}

export default function EcheanceForm({
  echeance,
  onSuccess,
  onCancel,
}: EcheanceFormProps) {
  const [titre, setTitre] = useState('')
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (echeance) {
      setTitre(echeance.titre)
      setMontant(echeance.montant.toString())
      setDate(echeance.date.split('T')[0])
    } else {
      setTitre('')
      setMontant('')
      setDate('')
    }
  }, [echeance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Validation des données
      const montantValue = parseFloat(montant)
      if (isNaN(montantValue) || montantValue < 0) {
        throw new Error('Le montant doit être un nombre positif')
      }

      if (!date) {
        throw new Error('La date est requise')
      }

      const now = new Date().toISOString()
      const data = {
        titre: titre.trim(),
        montant: montantValue,
        date: new Date(date + 'T00:00:00.000Z').toISOString(),
        owner: user.id,
        created_at: now,
        updated_at: now,
      }

      if (echeance?.id) {
        const { error } = await supabase
          .from('echeances')
          .update(data)
          .eq('id', echeance.id)
        if (error) {
          console.error('Supabase update error:', error)
          throw new Error(error.message || `Erreur Supabase: ${JSON.stringify(error)}`)
        }
      } else {
        const { error } = await supabase.from('echeances').insert([data])
        if (error) {
          console.error('Supabase insert error:', error)
          console.error('Data being inserted:', data)
          throw new Error(error.message || `Erreur Supabase: ${JSON.stringify(error)}`)
        }
      }

      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      console.error('Form submission error:', error)
      alert('Erreur: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="echeance-form-container animate-fade-in">
      <form onSubmit={handleSubmit} className="echeance-form">
        <div className="form-header">
          <h3 className="form-title">
            {echeance ? 'Modifier l\'échéance' : 'Nouvelle échéance'}
          </h3>
          {echeance && (
            <button
              type="button"
              onClick={onCancel}
              className="form-close-button"
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="titre" className="form-label">
              Titre <span className="required">*</span>
            </label>
            <input
              id="titre"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
              className="form-input"
              placeholder="Ex: Facture électricité"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="montant" className="form-label">
              Montant <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">F</span>
              <input
                id="montant"
                type="number"
                step="0.01"
                min="0"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                required
                className="form-input"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="date" className="form-label">
              Date d'échéance <span className="required">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="form-button form-button-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="form-button form-button-primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {echeance ? 'Modifier' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
