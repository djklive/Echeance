import { useState, useEffect } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import EcheanceForm from './EcheanceForm'
import './EcheanceList.css'

interface Echeance {
  id: number
  titre: string
  montant: number
  date: string
  paid: boolean
  owner: string
  created_at: string
  updated_at: string
}

export default function EcheanceList() {
  const [echeances, setEcheances] = useState<Echeance[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEcheance, setEditingEcheance] = useState<Echeance | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    loadEcheances()

    const channel = supabase
      .channel('echeances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'echeances',
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Realtime event:', payload)
          loadEcheances()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadEcheances = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('echeances')
        .select('*')
        .eq('owner', user.id)
        .order('date', { ascending: true })

      if (filter === 'paid') {
        query = query.eq('paid', true)
      } else if (filter === 'unpaid') {
        query = query.eq('paid', false)
      }

      if (dateFilter) {
        query = query.gte('date', dateFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setEcheances(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      console.error('Erreur lors du chargement:', error)
      alert('Erreur: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEcheances()
  }, [filter, dateFilter])

  const handleTogglePaid = async (id: number, currentPaid: boolean) => {
    try {
      const { error } = await supabase
        .from('echeances')
        .update({ paid: !currentPaid })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      alert('Erreur: ' + errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette échéance ?')) {
      return
    }
    try {
      const { error } = await supabase.from('echeances').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      alert('Erreur: ' + errorMessage)
    }
  }

  const handleEdit = (echeance: Echeance) => {
    setEditingEcheance(echeance)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEcheance(null)
    loadEcheances()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEcheance(null)
  }

  const handleNotify = async (echeance: Echeance) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert('Vous devez être connecté pour envoyer une notification')
        return
      }

      const {
        data,
        error,
      } = await supabase.functions.invoke('notify-echeance', {
        body: {
          echeanceId: echeance.id,
          userEmail: user.email,
        },
      })

      if (error) {
        console.error('Edge Function error:', error)
        throw error
      }

      console.log('Notification response:', data)
      alert('Notification envoyée avec succès !')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      console.error('Notification error:', error)
      alert('Erreur lors de l\'envoi de la notification: ' + errorMessage)
    }
  }

  const totalMontant = echeances.reduce((sum, e) => sum + e.montant, 0)
  const unpaidCount = echeances.filter(e => !e.paid).length
  const paidCount = echeances.filter(e => e.paid).length

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Chargement de vos échéances...</p>
      </div>
    )
  }

  return (
    <div className="echeance-list-container container">
      <div className="list-header">
        <div className="header-content-wrapper">
          <div>
            <h1 className="list-title">Mes Échéances</h1>
            <p className="list-subtitle">Gérez vos échéances en toute simplicité</p>
          </div>
          <button
            onClick={() => {
              setEditingEcheance(null)
              setShowForm(!showForm)
            }}
            className="add-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {showForm ? 'Masquer' : 'Nouvelle échéance'}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Total</p>
              <p className="stat-value">{totalMontant.toFixed(2)} FCFA</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-unpaid">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Non payées</p>
              <p className="stat-value">{unpaidCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-paid">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Payées</p>
              <p className="stat-value">{paidCount}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <EcheanceForm
          echeance={editingEcheance}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="status-filter" className="filter-label">Statut</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Toutes</option>
            <option value="paid">Payées</option>
            <option value="unpaid">Non payées</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="date-filter" className="filter-label">À partir du</label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="filter-clear"
            title="Effacer le filtre de date"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {echeances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h3 className="empty-title">Aucune échéance</h3>
          <p className="empty-text">
            {filter !== 'all' || dateFilter
              ? 'Aucune échéance ne correspond à vos filtres.'
              : 'Commencez par créer votre première échéance.'}
          </p>
          {(!filter || filter === 'all') && !dateFilter && (
            <button onClick={() => setShowForm(true)} className="empty-action-button">
              Créer une échéance
            </button>
          )}
        </div>
      ) : (
        <div className="echeances-grid">
          {echeances.map((echeance, index) => (
            <div
              key={echeance.id}
              className={`echeance-card ${echeance.paid ? 'echeance-paid' : 'echeance-unpaid'}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="card-header">
                <h3 className="card-title">{echeance.titre}</h3>
                <span className={`status-badge ${echeance.paid ? 'status-paid' : 'status-unpaid'}`}>
                  {echeance.paid ? 'Payée' : 'Non payée'}
                </span>
              </div>

              <div className="card-content">
                <div className="card-info">
                  <div className="info-item">
                    <span className="info-label">Montant</span>
                    <span className="info-value amount">{echeance.montant.toFixed(2)} FCFA</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date</span>
                    <span className="info-value date">
                      {new Date(echeance.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleTogglePaid(echeance.id, echeance.paid)}
                  className={`action-button ${echeance.paid ? 'action-button-warning' : 'action-button-success'}`}
                  title={echeance.paid ? 'Marquer comme non payée' : 'Marquer comme payée'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {echeance.paid ? (
                      <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                      <polyline points="20 6 9 17 4 12" />
                    )}
                  </svg>
                  {echeance.paid ? 'Non payée' : 'Payée'}
                </button>
                <button
                  onClick={() => handleEdit(echeance)}
                  className="action-button action-button-primary"
                  title="Modifier"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Modifier
                </button>
                <button
                  onClick={() => handleNotify(echeance)}
                  className="action-button action-button-info"
                  title="Envoyer une notification"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(echeance.id)}
                  className="action-button action-button-danger"
                  title="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
