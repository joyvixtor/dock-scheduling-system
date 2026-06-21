package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/joyvixtor/dock-scheduling-system/backend/crossdock/internal/domain"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateTransferTask(ctx context.Context, task *domain.TransferTask) (*domain.TransferTask, error) {
	const query = `
		INSERT INTO transfer_tasks (id, sku, quantity, inbound_dock_id, outbound_dock_id, status, operator_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.pool.Exec(ctx, query, task.ID, task.SKU, task.Quantity, task.InboundDockID, task.OutboundDockID, task.Status, task.OperatorID, task.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create transfer task: %w", err)
	}

	return task, nil
}

func (r *Repository) ActiveTransferTasks(ctx context.Context) ([]domain.TransferTask, error) {
	const query = `
		SELECT id, sku, quantity, inbound_dock_id, outbound_dock_id, status, operator_id, created_at
		FROM transfer_tasks
		WHERE status <> 'COMPLETED'
		ORDER BY created_at DESC
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query active transfer tasks: %w", err)
	}
	defer rows.Close()

	tasks := make([]domain.TransferTask, 0)
	for rows.Next() {
		var task domain.TransferTask
		if err := rows.Scan(&task.ID, &task.SKU, &task.Quantity, &task.InboundDockID, &task.OutboundDockID, &task.Status, &task.OperatorID, &task.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan transfer task: %w", err)
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate transfer tasks: %w", err)
	}

	return tasks, nil
}

func (r *Repository) UpdateTaskStatus(ctx context.Context, id string, status domain.TaskStatus, operatorID *string) (*domain.TransferTask, error) {
	const query = `
		UPDATE transfer_tasks
		SET status = $2, operator_id = $3
		WHERE id = $1
		RETURNING id, sku, quantity, inbound_dock_id, outbound_dock_id, status, operator_id, created_at
	`

	var task domain.TransferTask
	if err := r.pool.QueryRow(ctx, query, id, status, operatorID).Scan(&task.ID, &task.SKU, &task.Quantity, &task.InboundDockID, &task.OutboundDockID, &task.Status, &task.OperatorID, &task.CreatedAt); err != nil {
		return nil, fmt.Errorf("update task status: %w", err)
	}

	return &task, nil
}

func (r *Repository) FindTransferTaskByID(ctx context.Context, id string) (*domain.TransferTask, error) {
	const query = `
		SELECT id, sku, quantity, inbound_dock_id, outbound_dock_id, status, operator_id, created_at
		FROM transfer_tasks
		WHERE id = $1
	`

	var task domain.TransferTask
	if err := r.pool.QueryRow(ctx, query, id).Scan(&task.ID, &task.SKU, &task.Quantity, &task.InboundDockID, &task.OutboundDockID, &task.Status, &task.OperatorID, &task.CreatedAt); err != nil {
		return nil, fmt.Errorf("find transfer task by id: %w", err)
	}

	return &task, nil
}
