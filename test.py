@app.get("/materialinspectionreport")
def get_material_report(Ref_No: str, db: Session = Depends(init_db)):
    # seed_dimension_reports(db,Ref_No)
    record = db.query(MaterialInspection).filter(
        MaterialInspection.Reference_No == Ref_No
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No subcontract inspection report found for Reference_No {Ref_No}"
        )

    return record

# Data_Server.py
def initialize_material_inspection_entries(db: Session):
    # Fetch all records from the generated QR table
    qr_records = db.query(QRRecord_Generated).all()
    inserted = 0

    for qr in qr_records:
        # Check if an inspection entry already exists
        exists = db.query(MaterialInspection).filter(
            MaterialInspection.Reference_No == qr.Reference_No
        ).first()

        if exists:
            continue

        # Map QRRecord_Generated fields to MaterialInspection fields
        new_inspection = MaterialInspection(
            Reference_No=qr.Reference_No,
            Batch_Lot_No=qr.Batch_Lot_No,
            Description=qr.Description,
            PO_Number=qr.BEL_PO_No,
            GR_Number=qr.GR_No,
            GR_Date=qr.GR_Date.strftime("%Y-%m-%d") if qr.GR_Date else None,
            Vendor_Name=qr.Vendor_Name,
            Plant=qr.Manufacturing_Place,
            # Placeholder/Default values
            Revision_Level="00",
            Valuation_Type="Standard"
        )
        db.add(new_inspection)
        inserted += 1

    db.commit()
    return inserted


    # Data_Server.py
from fastapi import Body

@app.post("/material-inspection/save")
async def save_material_inspection(payload: dict = Body(...), db: Session = Depends(init_db)):
    ref_no = payload.get("Reference_No")
    if not ref_no:
        raise HTTPException(status_code=400, detail="Reference_No missing")

    # 1. Update Header (MaterialInspection table)
    meta_data = payload.get("meta", {})
    header = db.query(MaterialInspection).filter(MaterialInspection.Reference_No == ref_no).first()
    
    if header:
        for key, value in meta_data.items():
            if hasattr(header, key):
                setattr(header, key, value)
    else:
        header = MaterialInspection(Reference_No=ref_no, **meta_data)
        db.add(header)

    # 2. Update rows (MaterialTables table)
    # Clear existing rows to perform a clean overwrite
    db.query(MaterialTables).filter(MaterialTables.Reference_No == ref_no).delete()

    # Process frontend row states: rows1 (Visual), rows2 (Docs), rows3 (Test)
    sections = {
        "0010 - Visual": payload.get("rows1", []),
        "0020 - Documents": payload.get("rows2", []),
        "0030 - Testing": payload.get("rows3", [])
    }

    for type_label, rows in sections.items():
        for r in rows:
            db.add(MaterialTables(
                Reference_No=ref_no,
                Type=type_label,
                MIC_No=r.get("micNo"),
                MIC=r.get("mic"),
                MIC_Desc=r.get("desc"),
                Sampling_Procedure=r.get("samplingProc"),
                Sampling_Qty=r.get("sQty"),
                Inspected_Qty=r.get("iQty"),
                UoM=r.get("uom"),
                TargetValue=r.get("targetUom"),
                LowerLimit=r.get("lowerLimit"),
                UpperLimit=r.get("upperLimit"),
                SampleNo=r.get("sampleNo"),
                Result=r.get("result"),
                Valuation=r.get("valuation"),
                InspDate=date.today(),
                Remarks=r.get("inspDesc")
            ))

    db.commit()
    return {"status": "success", "message": "Inspection data saved"}
