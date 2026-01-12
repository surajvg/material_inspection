from fastapi import FastAPI, Depends,  UploadFile, File,Form
from models import QRRecord,SubContract_Inspection_Report
from datetime import datetime,date,timedelta
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from Database_models import Intender_Report,IndenterApproval,base,Measuring_Instruments_Used,Authorized_Person,DimensionCommonReport,DimensionSample,DimensionType,DimensionReport,LogBook_db,QRRecord_db,QRRecord_Generated,Measuring_Instruments,SubContract_Inspection,UserProfile,MaterialInspection,MaterialTables
from Database import session,engine
from typing import Annotated
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import joinedload


# from io import BytesIO
import io
# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str):
#     return pwd_context.hash(password)

app = FastAPI()

# Allow all origins (for dev/testing purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow any origin
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all headers
)

base.metadata.create_all(engine)


def init_db():
    db = session()
    try: 
        yield db
    finally:
        db.close()

def find_user_from_profiles(db: Session, staff: str):
    """Returns userProfiles row for staff number or None."""
    staff = staff.strip()
    return db.execute(
        select(UserProfile).where(func.trim(UserProfile.userID) == staff)
    ).scalar_one_or_none()

def Insert_Measurement_Parameters():
    db = next(init_db())

    count = db.query(Measuring_Instruments).count()

    if count == 0:    # only insert once

        instruments = [
            Measuring_Instruments(
                Description="Vernier Calipers",
                Equipment_ID=1,
                Measuring_Accuracy=0.02,
                Make_Model="Mitutoyo CD-6CS",
                Cal_Date=datetime.strptime("10-01-2024", "%d-%m-%Y"),
                Due_Date=datetime.strptime("10-01-2025", "%d-%m-%Y")
            ),
            Measuring_Instruments(
                Description="Scale",
                Equipment_ID=2,
                Measuring_Accuracy=0.03,
                Make_Model="Fisher Scale 150mm",
                Cal_Date=datetime.strptime("15-02-2024", "%d-%m-%Y"),
                Due_Date=datetime.strptime("15-02-2025", "%d-%m-%Y")
            ),
            Measuring_Instruments(
                Description="Tape",
                Equipment_ID=3,
                Measuring_Accuracy=0.01,
                Make_Model="Stanley 3M Tape",
                Cal_Date=datetime.strptime("20-03-2024", "%d-%m-%Y"),
                Due_Date=datetime.strptime("20-03-2025", "%d-%m-%Y")
            ),
        ]

        db.add_all(instruments)
        db.commit()

    db.close()

def seed_dimension_types():
    db = next(init_db())
    count = db.query(DimensionType).count()
    if count==0:
        names = ["Height", "Width", "Length", "Thickness","Resistance","Capacitance","Voltage","Conductance"]
        for name in names:
            exists = db.query(DimensionType).filter_by(Name=name).first()
            if not exists:
                db.add(DimensionType(Name=name))
        db.commit()

def seed_dimension_reports(db, ref_no: str):
    count  = db.query(DimensionReport).filter(DimensionReport.Reference_No==ref_no).count()
    if count == 0:

        types = db.query(DimensionType).all()
        for t in types:

            basic = 50.0  # Example
            tolerance = 0.2

            report = DimensionReport(
                Reference_No=ref_no,
                Dimension_Type_Id=t.Id,
                Basic_Dimension=basic,
                # Measuring_Instr_Id=1,  
                Tolerance=tolerance,
                Min=basic - tolerance,
                Max=basic + tolerance
            )
            db.add(report)
            db.commit()

        # Add 15 empty samples
        # for i in range(1, 16):
        #     sample = DimensionSample(
        #         Report_Id=report.Id,
        #         Sample_No=i,
        #         Value=None,
        #         Status=None
        #     )
        #     db.add(sample)

        # db.commit()

Insert_Measurement_Parameters()
seed_dimension_types()


# def seed_material_dimension_types():
#     db = next(init_db())
#     count = db.query(Material_DimensionType).count()
#     if count==0:
#         names = ["Height", "Width", "Length", "Thickness","Resistance","Capacitance","Voltage","Conductance"]
#         for name in names:
#             exists = db.query(Material_DimensionType).filter_by(Name=name).first()
#             if not exists:
#                 db.add(Material_DimensionType(Name=name))
#         db.commit()

# def seed_material_dimension_reports(db, ref_no: str):
#     count  = db.query(DimensionReport).filter(DimensionReport.Reference_No==ref_no).count()
#     if count == 0:

#         types = db.query(DimensionType).all()
#         for t in types:

#             basic = 50.0  # Example
#             tolerance = 0.2

#             report = DimensionReport(
#                 Reference_No=ref_no,
#                 Dimension_Type_Id=t.Id,
#                 Basic_Dimension=basic,
#                 # Measuring_Instr_Id=1,  
#                 Tolerance=tolerance,
#                 Min=basic - tolerance,
#                 Max=basic + tolerance
#             )
#             db.add(report)
#             db.commit()

#         # Add 15 empty samples
#         # for i in range(1, 16):
#         #     sample = DimensionSample(
#         #         Report_Id=report.Id,
#         #         Sample_No=i,
#         #         Value=None,
#         #         Status=None
#         #     )
#         #     db.add(sample)

#         # db.commit()

# Insert_Measurement_Parameters()
# seed_dimension_types()
# # seed_material_dimension_types()


def initialize_subcontract_entries(db: Session):

    # Fetch all Reference_Nos from QRRecord_Generated
    qr_records = db.query(QRRecord_Generated).all()
    inserted = 0

    # Get last used SAN_NO and Control_No
    last_entry = db.query(SubContract_Inspection).order_by(
        SubContract_Inspection.SAN_NO.desc()
    ).first()

    if last_entry:
        next_san = last_entry.SAN_NO + 1
        next_control = last_entry.Control_No + 1
    else:
        next_san = 1
        next_control = 1000

    for qr in qr_records:

        # Skip if already exists
        exists = db.query(SubContract_Inspection).filter(
            SubContract_Inspection.Reference_No == qr.Reference_No
        ).first()

        if exists:
            continue

        subcontract = SubContract_Inspection(
            Control_No=next_control,
            SAN_NO=next_san,
            Part_No=qr.BEL_Part_Number,
            Description=qr.Description,
            PO_NO=qr.BEL_PO_No,
            Vendor_Name=qr.Vendor_Name,
            Quantity=qr.Quantity,
            Sample="5 Nos",
            Sale_Order="SO-1234",
            Drg_Issue_Level=1,
            Reference_No=qr.Reference_No,
            Date=date.today()
        )

        db.add(subcontract)

        # Increment counters
        next_san += 1
        next_control += 1
        inserted += 1

    db.commit()
    return inserted

# def initialize_material_inspection_entries(db: Session):
#     # Fetch all records from the generated QR table
#     qr_records = db.query(QRRecord_Generated).all()
#     inserted = 0

#     for qr in qr_records:
#         # Check if an inspection entry already exists
#         exists = db.query(MaterialInspection).filter(
#             MaterialInspection.Reference_No == qr.Reference_No
#         ).first()

#         if exists:
#             continue

#         # Map QRRecord_Generated fields to MaterialInspection fields
#         new_inspection = MaterialInspection(
#             Reference_No=qr.Reference_No,
#             Batch_Lot_No=qr.Batch_Lot_No,
#             Description=qr.Description,
#             PO_Number=qr.BEL_PO_No,
#             GR_Number=qr.GR_No,
#             GR_Date=qr.GR_Date.strftime("%Y-%m-%d") if qr.GR_Date else None,
#             Vendor_Name=qr.Vendor_Name,
#             Plant=qr.Manufacturing_Place,
#             # Placeholder/Default values
#             Revision_Level="00",
#             Valuation_Type="Standard"
#         )
#         db.add(new_inspection)
#         inserted += 1

#     db.commit()
#     return inserted


#     # Data_Server.py
# from fastapi import Body

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
            # Plant=qr.Manufacturing_Place,
            # Placeholder/Default values
            Revision_Level="00",
            Valuation_Type="Standard"
        )
        db.add(new_inspection)
        inserted += 1

    db.commit()
    return inserted


# @app.post("/dimension-report/dummy")
# def insert_dummy_dimension_reports(Ref_No:str, db: Session = Depends(init_db)):

#     dummy_inputs = [
#         {"Basic_Dimension": 10.0, "Instrument_Id": 1, "Reference_No": Ref_No},
#         {"Basic_Dimension": 20.0, "Instrument_Id": 2, "Reference_No": Ref_No},
#         {"Basic_Dimension": 30.0, "Instrument_Id": 3, "Reference_No": Ref_No},
#         {"Basic_Dimension": 15.0, "Instrument_Id": 1, "Reference_No": Ref_No},
#         {"Basic_Dimension": 25.0, "Instrument_Id": 2, "Reference_No": Ref_No},
#     ]

#     for item in dummy_inputs:
#         instrument = db.query(Measuring_Instruments).filter(
#             Measuring_Instruments.Id == item["Instrument_Id"]
#         ).first()

#         if not instrument:
#             continue  # skip if missing instrument

#         tolerance = instrument.Measuring_Accuracy

#         report = Dimension_Report(
#             Basic_Dimension=item["Basic_Dimension"],
#             Measuring_Instr_Id=item["Instrument_Id"],
#             Tolerance=tolerance,
#             Min=item["Basic_Dimension"] - tolerance,
#             Max=item["Basic_Dimension"] + tolerance,
#             Reference_No=item["Reference_No"]
#         )

#         db.add(report)

#     db.commit()
#     return {"message": "Dummy dimension reports inserted"}




@app.get("/Instrumentdetails")
def get_details(db:Session = Depends(init_db)):
    db_records = db.query(Measuring_Instruments).all()
    return db_records

@app.get("/details")
def get_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_db).all()
    return db_records

# @app.post("/updatedetails")
# def add_details(data: dict, db:Session = Depends(init_db)):
    
#     # db.add(QRRecord_Generated(**data.model_dump()))

#     common_row = QRRecord_Generated(
#         # Reference_No=ref_no,
#         **data
#     )
#     db.add(common_row)
#     # record = db.query(QRRecord_db).filter_by(QRRecord_db.Reference_No==data.Reference_No).first()
#     # if record:
#     #     db.delete(record)
#     #     # db.commit()
#     ref_no = data['Reference_No']
#     db.query(QRRecord_db).filter(QRRecord_db.Reference_No == ref_no).delete()
#     db.commit()
#     # pn = normalize_part_number(data['BEL_Part_Number'])
#     # series = get_part_series(pn)

#     added = initialize_subcontract_entries(db)
#     return {"message": "added successfully"}




# @app.post("/updatedetails")
# def add_details(data: dict, db: Session = Depends(init_db)):
#     # 1. Create the Generated QR Record from the incoming data
#     common_row = QRRecord_Generated(**data)
#     db.add(common_row)
    
#     # 2. Cleanup: Remove the temporary record from QRRecord_db
#     ref_no = data.get('Reference_No')
#     db.query(QRRecord_db).filter(QRRecord_db.Reference_No == ref_no).delete()
#     db.commit()

#     qr_record = db.query(QRRecord_Generated).filter(
#         QRRecord_Generated.Reference_No == ref_no
#     ).first()
    
#     # if qr_record:
#     #     qr_record.overall_status = Status 

#     # 3. Conditional Logic: Route based on BEL_Part_Number
#     part_number = str(data.get('BEL_Part_Number', ''))
    
#     # Check if part number starts with '4' or is exactly '4'
#     if part_number.startswith('4'):
#         # Initialize Material Inspection table
#         added_count = initialize_material_inspection_entries(db)
#         qr_record.inspection_type = "Material Inspection"
#     else:
#         # Initialize Subcontract Inspection table
#         added_count = initialize_subcontract_entries(db)
#         qr_record.inspection_type = "Subcontract Inspection"
        
#     return {
#         "message": "Added successfully",
#         # "inspection_routed_to": inspection_type,
#         "records_initialized": added_count
#     }



@app.post("/updatedetails")
def add_details(data: dict, db: Session = Depends(init_db)):
    try:
        # 1. Determine the logic based on BEL_Part_Number FIRST
        part_number = str(data.get('BEL_Part_Number', ''))
        
        if part_number.startswith('4'):
            inspection_type_val = "Material Inspection"
            added_count = initialize_material_inspection_entries(db)
        else:
            inspection_type_val = "Subcontract Inspection"
            added_count = initialize_subcontract_entries(db)

        # 2. Assign the value to the data dict or the object
        # Ensure 'inspection_type' is a column in your QRRecord_Generated model
        common_row = QRRecord_Generated(**data)
        common_row.inspection_type = inspection_type_val  # <--- THIS SAVES IT TO DB
        
        db.add(common_row)
        
        # 3. Cleanup: Remove the temporary record
        ref_no = data.get('Reference_No')
        if ref_no:
            db.query(QRRecord_db).filter(QRRecord_db.Reference_No == ref_no).delete()
        
        # 4. Commit all changes at once
        db.commit()
        db.refresh(common_row)

        return {
            "status": "success",
            "message": "Added successfully",
            "inspection_routed_to": inspection_type_val,
            "records_initialized": added_count
        }

    except Exception as e:
        db.rollback() # Undo changes if something fails
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

@app.get("/generateddetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).filter(QRRecord_Generated.overall_status=="Generated").all()
    return db_records

@app.get("/generatedmaterialdetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).filter(QRRecord_Generated.overall_status=="Generated",QRRecord_Generated.inspection_type=="Material Inspection").all()
    return db_records

@app.get("/generatedsubcontractdetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).filter(QRRecord_Generated.overall_status=="Generated",QRRecord_Generated.inspection_type=="Subcontract Inspection").all()
    return db_records

@app.get("/inspecteddetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).filter(QRRecord_Generated.overall_status=="Inspected").all()
    return db_records

@app.get("/subcontractinspectionreport")
def get_subcontract_report(Ref_No: str, db: Session = Depends(init_db)):
    seed_dimension_reports(db,Ref_No)
    record = db.query(SubContract_Inspection).filter(
        SubContract_Inspection.Reference_No == Ref_No
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No subcontract inspection report found for Reference_No {Ref_No}"
        )

    return record


from fastapi import HTTPException

@app.put("/subcontractinspectionreport")
def update_subcontract_report(
    Ref_No: str,
    updated_data: dict,
    db: Session = Depends(init_db)
):

    # Fetch existing record
    record = db.query(SubContract_Inspection).filter(
        SubContract_Inspection.Reference_No == Ref_No
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No subcontract inspection report found for Reference_No {Ref_No}"
        )

    # Update only provided fields
    for field, value in updated_data.items():
        if hasattr(record, field) and value is not None:
            setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return {"message": "Subcontract inspection report updated successfully", "data": record}


# @app.get("/dimensionreport")
# def Get_Dimension_report(Ref_No:str, db: Session = Depends(init_db)):
#     Dimension_records = db.query(Dimension_Report).filter(Dimension_Report.Reference_No==Ref_No).all()
#     return Dimension_records


# @app.put("/dimensionreport")
# def update_dimension_report(
#     Ref_No: str,
#     updated_data: dict,
#     db: Session = Depends(init_db)
# ):

#     # Fetch all matching records
#     records = db.query(Dimension_Report).filter(
#         Dimension_Report.Reference_No == Ref_No
#     ).all()

#     if not records:
#         raise HTTPException(
#             status_code=404,
#             detail=f"No dimension report found for Reference_No {Ref_No}"
#         )

#     # Get list of valid model attributes
#     valid_fields = Dimension_Report.__table__.columns.keys()

#     # Update all records
#     for record in records:
#         for field, value in updated_data.items():
#             if field in valid_fields and value is not None:
#                 setattr(record, field, value)

#     db.commit()

#     return {
#         "message": f"{len(records)} record(s) updated successfully for Reference_No {Ref_No}"
#     }





# @app.delete("/delete/all")
# @app.delete("/admin/reset_all")
# def reset_all(db: Session = Depends(init_db)):

#     for tbl in ["qr_records", "log_book", "generated_qr_records", "dimension_instrument_map","measuring_instruments","subcontract_inspection","dimension_types",
#                         "dimension_reports","dimension_samples","dimension_common_report","intender_report","measuring_instrument_used","user_data"]:
#         if tbl in Base.metadata.tables:
#             Base.metadata.tables[tbl].drop(bind=engine, checkfirst=True)

#     Base.metadata.create_all(bind=engine)

#     return {"message": "Application tables reset (userProfiles NOT touched)"}

# from fastapi import Depends
# from sqlalchemy.orm import Session

# @app.delete("/admin/reset_all")
# def reset_all(db: Session = Depends(init_db)):

#     tables_to_reset = [
#         # "qr_records",
#         "log_book",
#         "dimension_instrument_map",
#         "subcontract_inspection",
#         "dimension_types",
#         "dimension_reports",
#         "dimension_samples",
#         "dimension_common_report",
#         "intender_report",
#         "measuring_instrument_used",
#         "measuring_instruments",
#         "user_data",
#         "generated_qr_records",
#     ]

#     for tbl in tables_to_reset:
#         if tbl in base.metadata.tables:
#             base.metadata.tables[tbl].drop(bind=engine, checkfirst=True)

#     # Recreate dropped tables
#     # Base.metadata.create_all(bind=engine)

#     return {"message": "Application tables reset (userProfiles NOT touched)"}


@app.delete("/admin/reset_all")
def reset_all(db: Session = Depends(init_db)):
    # Order matters: Drop child tables (with Foreign Keys) before parent tables
    tables_to_reset = [
        "dimension_samples",           # Depends on dimension_reports
        "dimension_instrument_map",    # Depends on dimension_reports & measuring_instruments
        "measuring_instrument_used",   # Depends on generated_qr_records & measuring_instruments
        "subcontract_inspection",      # Depends on generated_qr_records
        "dimension_reports",           # Depends on generated_qr_records & dimension_types
        "dimension_common_report",     # Depends on generated_qr_records
        "intender_report",             # Depends on generated_qr_records
        "user_data",                   # Depends on generated_qr_records
        "indenter_approval_details",   # Depends on generated_qr_records
        "indenter_table",              # Depends on userProfiles (but we delete this link)
        # "generated_qr_records",        # Parent of many
        "qr_records",                  # Standalone
        "log_book",                    # Standalone
        "dimension_types",             # Parent of dimension_reports
        "measuring_instruments",       # Parent of linksS
    ]

    try:
        for tbl in tables_to_reset:
            if tbl in base.metadata.tables:
                # Use checkfirst=True to avoid errors if a table was already gone
                base.metadata.tables[tbl].drop(bind=engine, checkfirst=True)
        
        # Optional: Recreate them immediately so the app doesn't crash on next query
        # base.metadata.create_all(bind=engine)
        
        return {"message": "All tables except userProfiles have been reset."}
    
    except Exception as e:
        return {"error": str(e)}


@app.get("/dimensionreport")
def get_dimensions(Ref_No: str, db: Session = Depends(init_db)):

    reports = (
        db.query(DimensionReport)
        .join(DimensionType)
        .filter(DimensionReport.Reference_No == Ref_No)
        .all()
    )

    result = []
    for r in reports:
        result.append({
            "Reference_No":r.Reference_No,
            "Dimension_Report_Id": r.Id,
            "Dimension_Name_Unit": r.dimension_type.Name,
            "Basic_Dimension": r.Basic_Dimension,
            "Tolerance": r.Tolerance,
            "Min": r.Min,
            "Max": r.Max
        })

    return result



# @app.post("/dimensionreport/samples")
# def submit_samples(payload: dict, db: Session = Depends(init_db)):
#     # payload keys: Reference_No, Samples (list)
#     ref = payload.get("ref_no")
#     items = payload.get("sample", [])

#     inserted = 0
#     for item in items:
#         report_id = item.get("report_id")
#         # validate report belongs to the reference (extra safety)
#         report = db.query(DimensionReport).filter(
#             DimensionReport.Id == report_id,
#             DimensionReport.Reference_No == ref
#         ).first()
#         if not report:
#             raise HTTPException(400, f"Report {report_id} not found for reference {ref}")

#         # optionally clear old samples for this report:
#         db.query(DimensionSample).filter(DimensionSample.Report_Id == report_id).delete()

#         # insert new samples
#         for s in item.get("samples", []):
#             sample_row = DimensionSample(
#                 Report_Id=report_id,
#                 Sample_No = int(s["sample_no"]),
#                 Value = float(s["value"]),
#                 Status = "Accepted" if (report.Min <= float(s["value"]) <= report.Max) else "Rejected"

#             )
#             print(sample_row)
#             db.add(sample_row)
#             inserted += 1

#     db.commit()
#     return {"message": "samples saved", "count": inserted}




@app.post("/dimensionreport/samples")
def save_dimension_report(payload: dict, db: Session = Depends(init_db)):

    ref_no = payload["Reference_No"]
    print(payload)
    instrument_id = payload.get('Instrument_id',[])
    # print(instrument_id)
    for id in instrument_id:
        count = db.query(Measuring_Instruments_Used).filter(Measuring_Instruments_Used.Reference_No==ref_no,
         Measuring_Instruments_Used.Equipment_ID==id).count()
        if count ==0:
            intrument_used = Measuring_Instruments_Used(
                Reference_No = ref_no,
                Equipment_ID = id


            )
            db.add(intrument_used)
            db.commit()
    # 1️⃣ Save COMMON DATA
    common = payload.get("Common", {})
    common_row = DimensionCommonReport(
        Reference_No=ref_no,
        **common
    )
    qr = db.query(DimensionCommonReport).filter(
            DimensionCommonReport.Reference_No == ref_no
        ).first()
    if not qr:
        db.add(common_row)
        db.commit()
    else:
        db.query(DimensionCommonReport).filter(
            DimensionCommonReport.Reference_No == ref_no
        ).delete()
        db.add(common_row)
        db.commit()
        # raise HTTPException(400, "Reference_No already exists")

    # 2️⃣ Save EACH DIMENSION + Samples
    for dim in payload["Dimensions"]:

        # Update or Insert Dimension Report
        report = db.query(DimensionReport).filter(
            DimensionReport.Id == dim["Report_Id"] 
        ).first()

        

        # if not report:
        #     report = DimensionReport(
        #         Id=dim["Report_Id"],
        #         Reference_No=ref_no
        #     )

        # report.Basic_Dimension = dim["Basic_Dimension"]
        # report.Tolerance = dim["Tolerance"]
        # report.Min = dim["Min"]
        # report.Max = dim["Max"]

        # db.add(report)
        # db.commit()

        # Clear old samples
        db.query(DimensionSample).filter(
            DimensionSample.Report_Id == report.Id
        ).delete()
        db.commit()

        # Insert new samples
        for s in dim["Samples"]:
            sample = DimensionSample(
                Report_Id=report.Id,
                Sample_No=s["Sample_No"],
                Value=s["Value"],
                Status=s["Status"],
                Remarks = s['Remarks'],
                Dimension_View_Parameter = s['Dimension_View_Parameter'],
                Dimension_Parameter_Unit = s['Dimension_Parameter_Unit']
            )
            db.add(sample)

        db.commit()

    return {"status": "success", "message": "Dimension data saved successfully"}



@app.post("/indentor/report")
def save_intender_report(payload: dict, db: Session = Depends(init_db)):

    try:
        ref_no = payload.get("Reference_No")
        if not ref_no:
            raise HTTPException(400, "Reference_No missing")

        # Check if the reference exists in QRRecord_Generated
        qr = db.query(QRRecord_Generated).filter(
            QRRecord_Generated.Reference_No == ref_no
        ).first()

        if not qr:
            raise HTTPException(
                status_code=404,
                detail=f"Reference_No '{ref_no}' does not exist in QRRecord_Generated"
            )

        # Insert new Intender report entry
        new_entry = Intender_Report(
            Reference_No=ref_no,
            Project_SaleOrder=payload.get("Project_SaleOrder"),
            Result=payload.get("Result"),
            Serial_Numbers=payload.get("Serial_Numbers"),
            Remarks=payload.get("Remarks"),
            Date=payload.get("Date"),
            Status=payload.get("Status"),

            userID = payload.get("userID"),
            userName = payload.get("userName"),
            userRole = payload.get("userRole"),
            userSBU = payload.get("userSBU"),
            userSBUDIV = payload.get("userSBUDIV")
        )

        assign = db.query(IndenterApproval).filter(IndenterApproval.Reference_No==ref_no).first()

        setattr(assign, "Status", payload.get("Status"))

        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)

        return {
            "status": "success",
            "message": "Intender report saved successfully",
            "data": {
                "Id": new_entry.Id,
                "Reference_No": new_entry.Reference_No
            }
        }

    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(500, f"Error saving Intender report: {e}")




# @app.post("/authorized-person/upload")
# async def upload_authorized_person(
#     Reference_No: str = Form(...),
    
    
#     # Installer Fields
#     insUserID: str = Form(None),
#     insUserName: str = Form(None),
#     insUserRole: str = Form(None),
#     insUserSBU: str = Form(None),
#     insUserSBUDIV: str = Form(None),
#     insDate: date = Form(...),
#     ins_file: UploadFile = File(...), # First File
    
#     # Approver Fields
#     appUserID: str = Form(None),
#     appUserName: str = Form(None),
#     appUserRole: str = Form(None),
#     appUserSBU: str = Form(None),
#     appUserSBUDIV: str = Form(None),
#     appDate : date = Form(None),
#     app_file: UploadFile = File(None), # Second File
    
#     remarks : str = Form(...),

#     appRemarks: str = Form(None),

    
#     db: Session = Depends(init_db),
# ):
    
    
#     # 1. Validate Reference
#     ref_exists = db.query(QRRecord_Generated).filter(
#         QRRecord_Generated.Reference_No == Reference_No
#     ).first()
#     if not ref_exists:
#         raise HTTPException(status_code=404, detail="Reference_No not found.")

#     # 2. Read both files
#     ins_bytes = await ins_file.read()
#     # app_bytes = await app_file.read()

#     # 3. Create the row with all data
#     new_row = Authorized_Person(
#         Reference_No=Reference_No,
        
#         # Installer Data
#         insUserID=insUserID,
#         insUserName=insUserName,
#         insUserRole=insUserRole,
#         insUserSBU=insUserSBU,
#         insUserSBUDIV=insUserSBUDIV,
#         insDate=insDate,
        
#         insfilename=ins_file.filename,
#         insmimetype=ins_file.content_type,
#         insdata=ins_bytes,
        
#         insRemarks =insRemarks,

#         # Approver Data
#         appUserID=appUserID,
#         appUserName=appUserName,
#         appUserRole=appUserRole,
#         appUserSBU=appUserSBU,
#         appUserSBUDIV=appUserSBUDIV,
#         appDate=appDate,

        
#         appfilename=app_file.filename,
#         appmimetype=app_file.content_type,
#         appdata=app_bytes,

#         appRemarks =appRemarks,


#     )

#     ref_exists.overall_status = "Inspected"

#     db.add(new_row)
#     db.commit()
#     db.refresh(new_row)

#     return {"status": "success", "id": new_row.id, "Reference_No": Reference_No}



@app.post("/authorized-person/upload")
async def upload_authorized_person(
    Reference_No: str=Form(None),
    insUserID: str=Form(None),
    insUserName: str=Form(None),
    insUserRole: str=Form(None),
    # insUserSBU: str=Form(None),
    # insUserSBUDIV: str=Form(None),
    insdate : date=Form(None),

    insRemarks: str=Form(None),

    ins_file: UploadFile = File(...),

    appUserID: str=Form(None),
    appUserName: str=Form(None),
    appUserRole: str=Form(None),
    appUserSBU: str=Form(None),
    appUserSBUDIV: str=Form(None),

    db: Session = Depends(init_db)
):
    print(appUserSBUDIV)
    inspector_details = db.query(UserProfile).filter(UserProfile.userID==insUserID).first()
    # 1. Check if data already exists in Authorized_Person table
    existing_entry = db.query(Authorized_Person).filter(
        Authorized_Person.Reference_No == Reference_No
    ).first()

    if existing_entry:
        raise HTTPException(
            status_code=400, 
            detail=f"Data for Reference No {Reference_No} already exists."
        )

    # 2. Validate that the Reference Number exists in the master QR table
    ref_master = db.query(QRRecord_Generated).filter(
        QRRecord_Generated.Reference_No == Reference_No
    ).first()

    
    if not ref_master:
        raise HTTPException(status_code=404, detail="Reference_No not found in master records.")

    # 2. Read Installer file
    ins_bytes = await ins_file.read()
    
    # 3. Create the row with ONLY Installer data
    new_row = Authorized_Person(
        Reference_No=Reference_No,
        insUserID=insUserID,
        insUserName=insUserName,
        insUserRole=insUserRole,
        insUserSBU=inspector_details.sbu,
        insUserSBUDIV=inspector_details.subdivision,

        insfilename=ins_file.filename,
        insmimetype=ins_file.content_type,
        insdata=ins_bytes,

        insRemarks=insRemarks,

        appUserID = appUserID,
        appUserName = appUserName,
        appUserRole = appUserRole,
        appUserSBU = appUserSBU,
        appUserSBUDIV = appUserSBUDIV,
    )
    
    ref_master.overall_status = "Inspected"


    db.add(new_row)
    db.commit()
    db.refresh(new_row)

    return {"status": "success", "id": new_row.id}


@app.put("/approver/ud")
async def approve_person(
    Ref_No: str = Form(...),
    appRemarks: str = Form(None),
    appDate: str = Form(None),
    Status: str = Form(...), 
    app_file: UploadFile = File(None),
    db: Session = Depends(init_db)
):
    person_record = db.query(Authorized_Person).filter(
        Authorized_Person.Reference_No == Ref_No
    ).first()

    if not person_record:
        raise HTTPException(status_code=404, detail="Authorized Person record not found.")

    if app_file:
        app_bytes = await app_file.read()
        person_record.appdata = app_bytes
        person_record.appfilename = app_file.filename
        person_record.appmimetype = app_file.content_type

    person_record.appDate = appDate
    person_record.appRemarks = appRemarks

    qr_record = db.query(QRRecord_Generated).filter(
        QRRecord_Generated.Reference_No == Ref_No
    ).first()
    
    if qr_record:
        qr_record.overall_status = Status 

    db.commit()
    db.refresh(person_record)

    return {"status": "Updated successfully", "overall_status": Status, "Reference_No": Ref_No}


@app.get("/authorized-person/list")
def list_authorized_person(Reference_No: str, db: Session = Depends(init_db)):
    rows = db.query(Authorized_Person).filter(
        Authorized_Person.Reference_No == Reference_No
    ).all()

    if not rows:
        return {"count": 0, "data": []}

    result = []
    for r in rows:
        result.append({
            "id": r.id,
            "Reference_No": r.Reference_No,
            # Inspector Data
            "inspector": {
                "name": r.insUserName,
                "staff_no": r.insUserID,
                "role": r.insUserRole,
                "date": r.insDate,
                "filename": r.insfilename,
            },
            # Approver Data
            "approver": {
                "name": r.appUserName,
                "staff_no": r.appUserID,
                "role": r.appUserRole,
                "date": r.appDate,
                "filename": r.appfilename,
            }
        })

    return {"count": len(result), "data": result}

# @app.get("/authorized-person/file/{ref_no}")
# def download_authorized_person_file(ref_no: str, db: Session = Depends(init_db)):
#     record = db.query(Authorized_Person).filter(Authorized_Person.Reference_No == ref_no).first()

#     if not record:
#         raise HTTPException(status_code=404, detail="File not found")

#     return StreamingResponse(
#         io.BytesIO(record.data),
#         media_type=record.mimetype,
#         headers={"Content-Disposition": f"attachment; filename={record.filename}"}
#     )

import io
from fastapi import HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

@app.get("/authorized-person/file/{ref_no}/{file_type}")
def download_authorized_person_file(ref_no: str, file_type: str, db: Session = Depends(init_db)):
    """
    Downloads the specific signature file.
    :param ref_no: The Reference_No of the record.
    :param file_type: Either 'inspector' or 'approver'.
    """
    # 1. Fetch the combined record using the Reference_No
    record = db.query(Authorized_Person).filter(
        Authorized_Person.Reference_No == ref_no
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # 2. Logic to select the correct file data based on the type requested
    if file_type.lower() == "inspector":
        file_content = record.insdata
        mimetype = record.insmimetype
        filename = record.insfilename
    elif file_type.lower() == "approver":
        file_content = record.appdata
        mimetype = record.appmimetype
        filename = record.appfilename
    else:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file_type. Use 'inspector' or 'approver'."
        )

    # 3. Check if the specific file exists in the record
    if not file_content:
        raise HTTPException(
            status_code=404, 
            detail=f"No {file_type} signature file found for this record."
        )

    # 4. Return the file as a stream
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=mimetype,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/debug/userprofiles")
def debug_userprofiles(db: Session = Depends(init_db)):
    return db.execute(select(UserProfile.userID)).scalars().all()

    #related for UI Visualization


@app.get("/inspection/full")
def get_full_inspection(Ref_No: str, db: Session = Depends(init_db)):

    # ---------------------------------------------------------
    # 1. QR RECORD
    # ---------------------------------------------------------
    qr = db.query(QRRecord_Generated).filter(
        QRRecord_Generated.Reference_No == Ref_No
    ).first()

    if not qr:
        raise HTTPException(404, f"Reference_No {Ref_No} not found")

    qr_data = {
        "Reference_No": qr.Reference_No,
        "BEL_Part_Number": qr.BEL_Part_Number,
        "Vendor_Name": qr.Vendor_Name,
        "Quantity": qr.Quantity,
        "GR_No": qr.GR_No,
        "Invoice_No": qr.Invoice_No,
        "MPN": qr.MPN,
        "Batch_Lot_No": qr.Batch_Lot_No,
        "DateCode": qr.DateCode,
        "Description": qr.Description,
        "Timestamp": str(qr.Timestamp) if qr.Timestamp else None
    }

    # ---------------------------------------------------------
    # 2. SUBCONTRACT
    # ---------------------------------------------------------
    subcontract = db.query(SubContract_Inspection).filter(
        SubContract_Inspection.Reference_No == Ref_No
    ).first()

    subcontract_data = None
    if subcontract:
        subcontract_data = {
            "SAN_NO": subcontract.SAN_NO,
            "Control_No": subcontract.Control_No,
            "Part_No": subcontract.Part_No,
            "Description": subcontract.Description,
            "PO_NO": subcontract.PO_NO,
            "Vendor_Name": subcontract.Vendor_Name,
            "Quantity": subcontract.Quantity,
            "Sample": subcontract.Sample,
            "Sale_Order": subcontract.Sale_Order,
            "Drg_Issue_Level": subcontract.Drg_Issue_Level,
            "Visual_Inspection": subcontract.Visual_Inspection,
            "Raw_Material_Supplied": subcontract.Raw_Material_Supplied,
            "Raw_Material_Test_Report": subcontract.Raw_Material_Test_Report,
            "Date": str(subcontract.Date) if subcontract.Date else None,
        }

    # ---------------------------------------------------------
    # 3. COMMON DIMENSION REPORT
    # ---------------------------------------------------------
    common = db.query(DimensionCommonReport).filter(
        DimensionCommonReport.Reference_No == Ref_No
    ).first()

    common_data = None
    if common:
        common_data = {
            "Remarks": common.Remarks,
            "Marking_On_Material": common.Marking_On_Material,
            "Dimension_Remark": common.Dimension_Remark,
            "Visual_Inspection_Report": common.Visual_Inspection_Report,
            "Electrical_Inspection_Remark": common.Electrical_Inspection_Remark,
            "Electrical_Parameter": common.Electrical_Parameter,
            "Functional": common.Functional,
            "Dimensions": common.Dimensions,
            "Visual_Inspection": common.Visual_Inspection,
            "COC": common.COC,
            "Test_Reports": common.Test_Reports,
            "Imported_Doc_Received": common.Imported_Doc_Received,
            "Malware_Free_Cert": common.Malware_Free_Cert,
            "FOD_Check": common.FOD_Check,
            "Counterfeit_Checked": common.Counterfeit_Checked,
            "MFG_Date": str(common.MFG_Date) if common.MFG_Date else None,
            "Exp_Date": str(common.Exp_Date) if common.Exp_Date else None,
            "Qty_Received": common.Qty_Received,
            "Qty_Inspected": common.Qty_Inspected,
            "Qty_Accepted": common.Qty_Accepted,
            "Qty_Rejected": common.Qty_Rejected,
            "Inspection_Remarks": common.Inspection_Remarks
        }


    # ---------------------------------------------------------
    # 4. DIMENSIONS + SAMPLES
    # ---------------------------------------------------------
    dimension_rows = (
        db.query(DimensionReport)
        .join(DimensionType, DimensionReport.Dimension_Type_Id == DimensionType.Id)
        .filter(DimensionReport.Reference_No == Ref_No)
        .all()
    )

    dimensions_list = []

    for d in dimension_rows:

        # Convert Measuring Instrument CSV → list[int]
        # if d.Measuring_Instr_Id:
        #     instrument_ids = [int(x) for x in d.Measuring_Instr_Id.split(",")]
        # else:
        # 2. Fetch Instrument IDs used for this inspection
        instruments_used = db.query(Measuring_Instruments_Used).filter(
            Measuring_Instruments_Used.Reference_No == Ref_No
        ).all()
        # Extract only the Equipment_ID into a list
        instrument_ids = [instr.Equipment_ID for instr in instruments_used]

        # instrument_ids = []

        # Fetch samples
        sample_rows = db.query(DimensionSample).filter(
            DimensionSample.Report_Id == d.Id
        ).order_by(DimensionSample.Sample_No).all()

        instrument = db.query(Measuring_Instruments).filter(
            Measuring_Instruments.Equipment_ID == Measuring_Instruments_Used.Equipment_ID).first()
        

        samples_list = [
            {
                "Id": s.Id,
                "Sample_No": s.Sample_No,
                "Value": s.Value,
                "Status": s.Status,
                "Remarks": s.Remarks,
                "Dimension_View_Parameter": s.Dimension_View_Parameter,
                "Dimension_Parameter_Unit": s.Dimension_Parameter_Unit,
            }
            for s in sample_rows
        ]

        dimensions_list.append({
            "Report_Id": d.Id,
            "Dimension_Type_Id": d.Dimension_Type_Id,
            "Dimension_Name": d.dimension_type.Name,
            "Basic_Dimension": d.Basic_Dimension,
            "Tolerance": d.Tolerance,
            "Min": d.Min,
            "Max": d.Max,
            "Measuring_Instruments": instrument,
            "Samples": samples_list
        })

    # dimension = db.query(DimensionSample).filter(
    #     DimensionSample.Reference_No == Ref_No
    # ).all()

    # dimension = None
    # if dimension:
    #     dimension_data = {
    #         "Id":dimension.Id,
    #         # Report_Id 
    #         # Sample_No 
    #         # Value 
    #         # Status 
    #         # Remarks 
    #         # Dimension_View_Parameter 
    #         # Dimension_Parameter_Unit 
    #     },

    dimension_data = db.query(DimensionReport).options(joinedload(DimensionReport.samples))\
        .filter(DimensionReport.Reference_No == Ref_No).all()

    results = []
    indentor = db.query(Intender_Report).filter(
        Intender_Report.Reference_No == Ref_No
    ).all()

    for indent in indentor:

            indent = {
                "Project_SaleOrder" : indent.Project_SaleOrder,
                "Serial_Numbers": indent.Serial_Numbers,
                "Result" : indent.Result,
                "Remarks": indent.Remarks,
                "Date" : indent.Date,
                "Status" :indent.Status,
                "UserID" : indent.userID,
                "UserName" : indent.userName,
                "UserRole" : indent.userRole,
                "UserSBU" : indent.userSBU,
                "UserSBUDIV" : indent.userSBUDIV,
            },
            results.append({"Data" : indent})




    record = db.query(Authorized_Person).filter(
        Authorized_Person.Reference_No == Ref_No
    ).first()


    remarks = {
        "Remarks": record.insRemarks if record else "",
        
        "insUserID" : record.insUserID if record else "",
        "insUserName" : record.insUserName if record else "",
        "insUserRole" : record.insUserRole if record else "",
        "insUserSBU" : record.insUserSBU if record else "",
        "insUserSBUDIV" : record.insUserSBUDIV if record else "",
        "insDate" : record.insDate if record else "",       

        "appUserID" : record.appUserID if record else "",
        "appUserName" : record.appUserName if record else "",
        "appUserRole" : record.appUserRole if record else "",
        "appUserSBU" : record.appUserSBU if record else "",
        "appUserSBUDIV" : record.appUserSBUDIV if record else "",
        
        }
    

    # ---------------------------------------------------------
    # FINAL RESPONSE
    # ---------------------------------------------------------
    return {
        "QR_Record": qr_data,
        "SubContract": subcontract_data,
        "Common_Dimension": common_data,
        "Dimensions": dimensions_list,
        "Indentor_Data": results,
        "dimensions": dimension_data,
        "Inspection_Report" : remarks
    }



from fastapi import Query

@app.get("/indenter/details")
def get_indenter_details( sbu:str, db: Session = Depends(init_db)):
    """
    Retrieves user details from UserProfile table 
    filtered by a specific SBU and the 'Indenter' role.
    """
    TARGET_ROLE = "Indentor"

    records = db.query(UserProfile).filter(
        UserProfile.userRole == TARGET_ROLE,
        UserProfile.sbu == sbu,
    ).all()
    
    result = []
    for r in records:
        result.append({
            "username": r.username ,
            "userID":  r.userID,
            "userRole": r.userRole,
            "sbu":r.sbu,
            "subdivision": r.subdivision,
        })
    
    return result

@app.get("/approver/details")
def get_indenter_details( sbu:str, db: Session = Depends(init_db)):
    if not sbu:
        raise HTTPException(400, "sbu missing")
    TARGET_ROLE = "Approver"

    records = db.query(UserProfile).filter(
        UserProfile.userRole == TARGET_ROLE,
        UserProfile.sbu == sbu,
    ).all()
    
    result = []
    for r in records:
        result.append({
            "username": r.username ,
            "userID":  r.userID,
            "userRole": r.userRole,
            "sbu":r.sbu,
            "subdivision": r.subdivision,
        })
    
    return result


@app.post("/indenter/update")
def update_status(payload: dict, db: Session = Depends(init_db)):
    # print(payload)
    # return {"message": "Updated"}
    try:
        ref_no = payload.get("Reference_No")
        if not ref_no:
            raise HTTPException(400, "Reference_No missing")

        # ind_ID = payload.get("indUserID")

        # # Check if the reference exists
        # # qr = db.query(IndenterApproval).filter(
        # #     IndenterApproval.Reference_No == ref_no
        # # ).first()

        # if not ind_ID:
        #     raise HTTPException(
        #         status_code=403,
        #         detail=f"Not Authorised"
        #     )

        # Insert new Intender report entry
        new_entry = IndenterApproval(

            Reference_No=payload.get("Reference_No"),
            serialNo =payload.get("Serial_No"),
            indUserID = payload.get("indUserID"),
            indUserName = payload.get("indUserName"),
            # indUserRole= payload.get("indUserRole"),
            indUserSBU= payload.get("indUserSBU"),
            indUserSBUDIV=payload.get("indUserSBUDIV"),
            indPhoneNo = payload.get("indPhoneNo"),
            # date=datetime.strptime(payload.get("date"), "%d-%m-%Y")
            #     if payload.get("date") else datetime.now(),
            date = payload.get("date"),
            insUserID = payload.get("insUserID"),
            insUserName = payload.get("insUserName"),
            insUserRole = payload.get("insUserRole"),
            insUserSBU = payload.get("insUserSBU"),
            insUserSBUDIV = payload.get("insUserSBUDIV"),

            Status=payload.get("Status")

        
        )


        # status =db.get

        # assignment = db.get(PCBAssignment, log.assignment_id)

        # if current_step.next_step_id is None:
        # assignment.overall_status = "COMPLETED"
        # assignment.current_step_id = None
        # db.commit()
        # return

        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)

        return {
            "status": "success",
            "message": "Intender report updated successfully",
            "data": {
                # "Id": new_entry.Id,
                "Reference_No": new_entry.Reference_No
            }
        }

    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(500, f"Error saving Intender report: {e}")
    
@app.get("/indentor/ref/all")
def get_indenter_ref_all(db: Session = Depends(init_db)):
    refnos = db.execute(select(IndenterApproval.Reference_No)).scalars().all()
    result = {
        "Reference_No":refnos
    }
    return result
        
   
@app.get("/indentor/ref")
def get_indentor_ref_details(Ref_No:str,db: Session = Depends(init_db)):


    record = db.query(QRRecord_Generated).filter(
        QRRecord_Generated.Reference_No == Ref_No
    ).first()
    # print(type(record))
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No Generated QR report found for Reference_No {Ref_No}"
        )



    sub_record = db.query(SubContract_Inspection).filter(
        SubContract_Inspection.Reference_No == Ref_No
    ).first()
    if not sub_record:
        raise HTTPException(
            status_code=404,
            detail=f"No subcontract inspection report found for Reference_No {Ref_No}"
        )



    Ind_record = db.query(IndenterApproval).filter(
        IndenterApproval.Reference_No == Ref_No
    ).first()
    if not Ind_record:
        raise HTTPException(
            status_code=404,
            detail=f"No Indentor record found for Reference_No {Ref_No}"
        )


    result = {

        "SO_Number":sub_record.Sale_Order,
        "Reference_No":Ref_No,
        "Description":record.Description,
        "PO_Number":record.BEL_PO_No,
        "Part_Number":record.BEL_Part_Number,
        "GR_Number":record.GR_No,
        "Supplier":record.Vendor_Name,
        "Quantity":record.Quantity,
        "Serial_No":Ind_record.serialNo,

        "insUserID" : Ind_record.insUserID,
        "insUserName" : Ind_record.insUserName,
        "insUserRole" : Ind_record.insUserRole,
        "insUserSBU" : Ind_record.insUserSBU,
        "insUserSBUDIV" : Ind_record.insUserSBUDIV

    }
    return result


# @app.get("/indentor/status")
# def get_indentor_status(Ref_No:str,db: Session = Depends(init_db)):
#     print(Ref_No)
    
#     if not Ref_No:
#         raise HTTPException(400, "Reference_No missing")
#     record = db.query(Intender_Report).filter(
#         Intender_Report.Reference_No == Ref_No
#     ).first()

#     result = {
#         "Reference_No":Ref_No,
#         "Result": record.Result,
#         "Serial_Numbers": record.Serial_Numbers,
#         "Remarks":record.Remarks,
#         "Status": record.Status,
#     }
#     return result

@app.get("/indentor/status")
def get_indentor_status(Ref_No: str, db: Session = Depends(init_db)):
    if not Ref_No:
        raise HTTPException(400, "Reference_No missing")
    
    # Use .all() to get all matching records
    records = db.query(Intender_Report).filter(
        Intender_Report.Reference_No == Ref_No
    ).all()

    # Return a list of dictionaries
    return [
        {
            "Reference_No": Ref_No,
            "Result": rec.Result,
            "Serial_Numbers": rec.Serial_Numbers,
            "Remarks": rec.Remarks,
            "Status": rec.Status,
        } for rec in records
    ]


# @app.post("/approver/ud")
# async def approver_ud( 
#     Ref_No :str = Form(...),
#     appDate : date = Form(...),
#     app_file : UploadFile = File(...),
#     appRemarks : str = Form(...),
#     db : Session = Depends(init_db)
# ):
#     ref_exists = db.query(QRRecord_Generated).filter(
#         QRRecord_Generated.Reference_No == Reference_No
#     ).first()
#     if not ref_exists:
#         raise HTTPException(status_code=404, detail="Reference_No not found.")

# @app.put("/approver/ud")
# async def approver_ud(
#     Reference_No :str = Form(...),
#     appDate : date = Form(...),
#     app_file : UploadFile = File(...),
#     appRemarks : str = Form(...),
#     overall_status: str = Form(...),
#     db : Session = Depends(init_db)
# ):
#     ref_exists = db.query(QRRecord_Generated).filter(
#         QRRecord_Generated.Reference_No == Reference_No
#     ).first()
#     if not ref_exists:
#         raise HTTPException(status_code=404, detail="Reference_No not found.")

#     app_bytes = await app_file.read()

#     ref = db.query(Authorized_Person).filter(
#         Authorized_Person.Reference_No == Reference_No
#     ).first()

    
#     ref.Reference_No=Reference_No,
#     ref.appDate=appDate,
#     ref.appfilename=app_file.filename,
#     ref.appmimetype=app_file.content_type,
#     ref.appdata=app_bytes,
#     ref.appRemarks =appRemarks,


    

#     ref_exists.overall_status = overall_status

#     db.add(new_row)
#     db.commit()
#     db.refresh(new_row)

#     return {"status": "success", "id": new_row.id, "Reference_No": Reference_No}

@app.get("/approved/GRdetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).filter(QRRecord_Generated.overall_status=="Approved").all()
    return db_records


@app.get("/rejected/GRdetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).filter(QRRecord_Generated.overall_status=="Rejected").all()
    return db_records


@app.get("/total/GRdetails")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(QRRecord_Generated).all()
    return db_records

@app.get("/logdata")
def get_generated_details(db:Session = Depends(init_db)):
    db_records = db.query(LogBook_db).all()
    return db_records

@app.post("/logdata/save")
def save_logdata(payload: dict, db: Session = Depends(init_db)):

    print(payload)
    new_entry = LogBook_db(

        # SL_No = payload.get("Serial_Numbers"),
        Timestamp =payload.get("Timestamp"),
        BEL_Part_Number = payload.get("BEL_Part_Number"),
        MPN = payload.get("MPN"),
        Batch_Lot_No = payload.get("Batch_Lot_No"),
        DateCode = payload.get("DateCode"),
        Quantity = payload.get("Quantity"),
        BEL_PO_No = payload.get("BEL_PO_No"),
        Vendor_Name = payload.get("Vendor_Name"),
        OEM_Make = payload.get("OEM_Make"),
        Manufacturing_Place = payload.get("Manufacturing_Place"),
    )

    db.add(new_entry)
    db.commit()

    db.refresh(new_entry)

    return {
        "status": "success",
        "message": " log saved successfully",
        "data": {
            "Id": new_entry.SL_No,
            "BEL_Part_Number": new_entry.BEL_Part_Number
        }
    }




# @app.get("/materialinspectionreport")
# def get_material_report(Ref_No: str, db: Session = Depends(init_db)):
#     # seed_dimension_reports(db,Ref_No)
    
#     # seed_material_dimension_reports(db,Ref_No)

#     record = db.query(MaterialInspection).filter(
#         MaterialInspection.Reference_No == Ref_No
#     ).first()

#     if not record:
#         raise HTTPException(
#             status_code=404,
#             detail=f"No subcontract inspection report found for Reference_No {Ref_No}"
#         )

#     return record

@app.get("/materialinspectionreport")
def get_material_report(Ref_No: str, db: Session = Depends(init_db)):
    seed_dimension_reports(db,Ref_No)
    record = db.query(MaterialInspection).filter(
        MaterialInspection.Reference_No == Ref_No
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No subcontract inspection report found for Reference_No {Ref_No}"
        )

    return record

@app.post("/materialinspection/save")
async def save_material_inspection(payload: dict, db: Session = Depends(init_db)):
    print(payload["inspection_rows"])
    payload2=payload["inspection_rows"]

    # for p in payload2:

    ref_no = payload.get("Reference_No")
    t_type = payload.get("Type")
    if not ref_no:
        raise HTTPException(status_code=400, detail="Reference_No missing")

    db.query(MaterialTables).filter(MaterialTables.Reference_No == ref_no,MaterialTables.Type == t_type ).delete()

    new_entry = MaterialTables(

    Reference_No=ref_no,
    Type=payload.get("Type"),
    InspDate=date.today(),
    Remarks=payload.get("Remarks"),

    MIC_No=payload2[0].get("MIC_No"),
    MIC=payload2[0].get("MIC"),
    MIC_Desc=payload2[0].get("MIC_Desc"),
    Sampling_Procedure=payload2[0].get("Sampling_Procedure"),
    Sampling_Qty=payload2[0].get("Sampling_Qty"),
    Inspected_Qty=payload2[0].get("Inspected_Qty"),
    UoM=payload2[0].get("UoM"),
    TargetValue=payload2[0].get("TargetValue"),
    LowerLimit=payload2[0].get("LowerLimit"),
    UpperLimit=payload2[0].get("UpperLimit"),
    SampleNo=payload2[0].get("SampleNo"),
    Result=payload2[0].get("Result"),
    Valuation=payload2[0].get("Valuation"),
    )
    db.add(new_entry)
    db.commit()
    return {"status": "success", "message": "Inspection data saved"}

    # 1. Update Header (MaterialTables table)
    # meta_data = payload.get("meta", {})
    # header = db.query(MaterialTables).filter(MaterialTables.Reference_No == ref_no).first()
    
    # if header:
    #     for key, value in meta_data.items():
    #         if hasattr(header, key):
    #             setattr(header, key, value)
    # else:
    #     header = MaterialTables(Reference_No=ref_no, **meta_data)
    #     db.add(header)

    # 2. Update rows (MaterialTables table)
    # Clear existing rows to perform a clean overwrite
    # db.query(MaterialTables).filter(MaterialTables.Reference_No == ref_no).delete()

    # Process frontend row states: rows1 (Visual), rows2 (Docs), rows3 (Test)
    # sections = {
    #     "0010 - Visual": payload.get("rows1", []),
    #     "0020 - Documents": payload.get("rows2", []),
    #     "0030 - Testing": payload.get("rows3", [])
    # }

    # for type_label, rows in sections.items():
    #     for r in rows:
    #         db.add(MaterialTables(
    #             Reference_No=ref_no,
    #             Type=type_label,
    #             MIC_No=r.get("MIC_No"),
    #             MIC=r.get("MIC"),
    #             MIC_Desc=r.get("MIC_Desc"),
    #             Sampling_Procedure=r.get("Sampling_Procedure"),
    #             Sampling_Qty=r.get("Sampling_Qty"),
    #             Inspected_Qty=r.get("Inspected_Qty"),
    #             UoM=r.get("UoM"),
    #             TargetValue=r.get("TargetValue"),
    #             LowerLimit=r.get("LowerLimit"),
    #             UpperLimit=r.get("UpperLimit"),
    #             SampleNo=r.get("SampleNo"),
    #             Result=r.get("Result"),
    #             Valuation=r.get("Valuation"),
    #             InspDate=date.today(),
    #             Remarks=r.get("Remarks")
    #         ))

@app.post("/materialinspection/sample")
async def save_material_inspection(payload: dict, db: Session = Depends(init_db)):
    print(payload["inspection_rows"])
    payload2=payload["inspection_rows"]

    # for p in payload2:
    
    ref_no = payload.get("Reference_No")
    t_type = payload.get("Type")

    instrument_id = payload.get('Instrument_id',[])
    # print(instrument_id)
    for id in instrument_id:
        count = db.query(Measuring_Instruments_Used).filter(Measuring_Instruments_Used.Reference_No==ref_no,
         Measuring_Instruments_Used.Equipment_ID==id).count()
        if count ==0:
            intrument_used = Measuring_Instruments_Used(
                Reference_No = ref_no,
                Equipment_ID = id


            )
            db.add(intrument_used)
            db.commit()

    if not ref_no:
        raise HTTPException(status_code=400, detail="Reference_No missing")

    db.query(MaterialTables).filter(MaterialTables.Reference_No == ref_no,MaterialTables.Type == t_type ).delete()

    new_entry = MaterialTables(

    Reference_No=ref_no,
    Type=payload.get("Type"),
    InspDate=date.today(),
    Remarks=payload.get("Remarks"),

    MIC_No=payload2[0].get("MIC_No"),
    MIC=payload2[0].get("MIC"),
    MIC_Desc=payload2[0].get("MIC_Desc"),
    Sampling_Procedure=payload2[0].get("Sampling_Procedure"),
    Sampling_Qty=payload2[0].get("Sampling_Qty"),
    Inspected_Qty=payload2[0].get("Inspected_Qty"),
    UoM=payload2[0].get("UoM"),
    TargetValue=payload2[0].get("TargetValue"),
    LowerLimit=payload2[0].get("LowerLimit"),
    UpperLimit=payload2[0].get("UpperLimit"),
    SampleNo=payload2[0].get("SampleNo"),
    Result=payload2[0].get("Result"),
    Valuation=payload2[0].get("Valuation"),
    )
    db.add(new_entry)
    db.commit()
    return {"status": "success", "message": "Inspection data saved"}

   

    

    
    

@app.put("/materialinspectionreport")
def update_material_inspection_report(
    Ref_No: str,
    updated_data: dict,
    db: Session = Depends(init_db)
):

    # Fetch existing record
    record = db.query(MaterialInspection).filter(
        MaterialInspection.Reference_No == Ref_No
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No MaterialInspection report found for Reference_No {Ref_No}"
        )

    # Update only provided fields
    for field, value in updated_data.items():
        if hasattr(record, field) and value is not None:
            setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return {"message": "MaterialInspection  report updated successfully", "data": record}


@app.post("/materialdimensionreport/samples")
def save_material_dimension_report(payload: dict, db: Session = Depends(init_db)):

    ref_no = payload["Reference_No"]

    instrument_id = payload.get('Instrument_id',[])
    # print(instrument_id)
    for id in instrument_id:
        count = db.query(Measuring_Instruments_Used).filter(Measuring_Instruments_Used.Reference_No==ref_no,
         Measuring_Instruments_Used.Equipment_ID==id).count()
        if count ==0:
            intrument_used = Measuring_Instruments_Used(
                Reference_No = ref_no,
                Equipment_ID = id


            )
            db.add(intrument_used)
            db.commit()
    # 1️⃣ Save COMMON DATA
    common = payload.get("Common", {})
    common_row = DimensionCommonReport(
        Reference_No=ref_no,
        **common
    )
    qr = db.query(DimensionCommonReport).filter(
            DimensionCommonReport.Reference_No == ref_no
        ).first()
    if not qr:
        db.add(common_row)
        db.commit()
    else:
        db.query(DimensionCommonReport).filter(
            DimensionCommonReport.Reference_No == ref_no
        ).delete()
        db.add(common_row)
        db.commit()
        # raise HTTPException(400, "Reference_No already exists")

    # 2️⃣ Save EACH DIMENSION + Samples
    for dim in payload["Dimensions"]:

        # Update or Insert Dimension Report
        report = db.query(MaterialTables).filter(
            MaterialTables.Id == dim["Report_Id"] 
        ).first()

        

        # if not report:
        #     report = MaterialTables(
        #         Id=dim["Report_Id"],
        #         Reference_No=ref_no
        #     )

        # report.Basic_Dimension = dim["Basic_Dimension"]
        # report.Tolerance = dim["Tolerance"]
        # report.Min = dim["Min"]
        # report.Max = dim["Max"]

        # db.add(report)
        # db.commit()

        # Clear old samples
        db.query(MaterialTables).filter(
            MaterialTables.Report_Id == report.Id
        ).delete()
        db.commit()

        # Insert new samples
        for s in dim["Samples"]:
            sample = MaterialTables(
                Report_Id=report.Id,

                # MIC_No = Column(Integer)	
                # MIC	= Column(String)
                # MIC_Desc = Column(String)
                # Sampling_Procedure = Column(String)
                # Sampling_Qty = Column(String)	
                # Inspected_Qty = Column(String)
                # UoM	= Column(String)
                # TargetValue	= Column(String)
                # LowerLimit = Column(String)
                # UpperLimit	= Column(String)
                # SampleNo = Column(Integer)	
                # Result = Column(String)
                # Valuation = Column(String)
                # InspDate = Column(Date)

               
                Sample_No=s["Sample_No"],
                Value=s["Value"],
                Status=s["Status"],
                Remarks = s['Remarks'],
                Dimension_View_Parameter = s['Dimension_View_Parameter'],
                Dimension_Parameter_Unit = s['Dimension_Parameter_Unit']
            )
            db.add(sample)

        db.commit()

    return {"status": "success", "message": "Dimension data saved successfully"}

@app.get("/traceability")
def get_traceability_details(ref_no: str, db: Session = Depends(init_db)):
    # 1. Fetch Log Entry (LogBook_db)
    # Note: LogBook_db doesn't have Reference_No in the snippet, 
    # but QRRecord_Generated (QR) is created from it. 
    # We'll use the QR record's timestamp as the generation point.
    
    qr_record = db.query(QRRecord_Generated).filter(
        QRRecord_Generated.Reference_No == ref_no
    ).first()

    if not qr_record:
        raise HTTPException(status_code=404, detail="Traceability record not found")

    # 2. Fetch Inspection Start/End (Authorized_Person contains submission data)
    inspection_details = db.query(Authorized_Person).filter(
        Authorized_Person.Reference_No == ref_no
    ).first()

    # 3. Fetch Approver details (IndenterApproval / Authorized_Person)
    # Based on the models, 'Authorized_Person' stores appDate (Approval Date) 
    # and 'overall_status' in QRRecord_Generated tracks the stage.

    return {
        "reference_no": ref_no,
        "part_info": {
            "part_number": qr_record.BEL_Part_Number,
            "description": qr_record.Description,
            "vendor": qr_record.Vendor_Name
        },
        "timeline": {
            "log_entry": qr_record.Timestamp,  # When the data was first logged
            "gr_date": qr_record.GR_Date,      # Goods Receipt Date
            "qr_generated": qr_record.Timestamp, # Timestamp when QR was finalized
            "inspection_started": inspection_details.insDate if inspection_details else None,
            "inspection_submitted": inspection_details.insDate if inspection_details else None,
            "inspection_remarks": inspection_details.insRemarks if inspection_details else None,
            "approval_date": inspection_details.appDate if inspection_details else None,
            "approval_status": qr_record.overall_status,
            "approver_remarks": inspection_details.appRemarks if inspection_details else None
        }
    }













