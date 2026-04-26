from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_both_dbs
from services.sync_service import SyncService
from schemas.schemas import (
    SyncRequest, SyncResponse,
    DeleteValidationRequest, DeleteValidationResponse,
    DeleteConfirmRequest,
)

router = APIRouter(prefix="/api/sync", tags=["Sync"])


@router.post("/employees", response_model=SyncResponse)
def sync_employees(request: SyncRequest, dbs: tuple = Depends(get_both_dbs)):
    hr_db, payroll_db = dbs
    return SyncService.sync_employees(hr_db, payroll_db, request.employee_ids)


@router.post("/all")
def sync_all(dbs: tuple = Depends(get_both_dbs)):
    hr_db, payroll_db = dbs
    dept_count = SyncService.sync_departments(hr_db, payroll_db)
    pos_count  = SyncService.sync_positions(hr_db, payroll_db)
    emp_result = SyncService.sync_employees(hr_db, payroll_db)
    return {
        "success": True,
        "message": "Full sync completed",
        "details": {
            "departments_synced": dept_count,
            "positions_synced":   pos_count,
            "employees_synced":   emp_result["synced_count"],
            "employees_failed":   emp_result["failed_count"],
        },
    }


@router.post("/validate-deletion", response_model=DeleteValidationResponse)
def validate_deletion(request: DeleteValidationRequest, dbs: tuple = Depends(get_both_dbs)):
    hr_db, payroll_db = dbs
    return SyncService.validate_deletion(hr_db, payroll_db, request.employee_id)


@router.post("/delete-employee")
def delete_employee_validated(request: DeleteConfirmRequest, dbs: tuple = Depends(get_both_dbs)):
    hr_db, payroll_db = dbs

    if not request.force_delete:
        validation = SyncService.validate_deletion(hr_db, payroll_db, request.employee_id)
        if not validation["can_delete"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "message":  "Cannot delete employee",
                    "reasons":  validation["blocking_reasons"],
                    "warnings": validation["warnings"],
                },
            )

    result = SyncService.delete_employee_cascade(
        hr_db, payroll_db, request.employee_id, request.cascade_delete
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result