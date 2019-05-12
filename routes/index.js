const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const moment = require("moment");
const DB = require("better-sqlite3-helper");

DB({
    path: "db.sqlite3",
    memory: false,
    readonly: false,
    fileMustExist: false,
    WAL: true,
});

function checkUndefined(str) {
    if (typeof str === "undefined")
        return null;
    return str
}

function userTypeConverter(type) {
    let str = "";
    switch (type) {
        case 0:
            str = "사용자";
            break;
        case 1:
            str = "드라이버";
            break;
    }
    return str;
}

function statusCodeConverter(status) {
    let str = "";
    switch (status) {
        case 0:
            str = "배차요청";
            break;
        case 1:
            str = "배차완료";
            break;
        case 2:
            str = "운행완료";
            break;
        case 3:
            str = "배차취소";
            break;
    }
    return str;
}

/* GET users listing. */
router.get("/users", function (req, res, next) {
    try {
        const result = DB().query("select id, email, type from user");
        result.forEach(function (item) {
            item.type=userTypeConverter(item.type)
        })
        res.json(result)
    } catch (e) {
        res.status(503).json({error: e.message})
    }

}).post("/users", function (req, res, next) {
    try {
        const result = DB().insert("user", req.body);
        res.json("회원가입 완료")
    } catch (e) {
        res.status(409).json({error: e.message})
    }
}).post("/login", function (req, res, next) {
    try {
        const result = DB().query("select id, email, type from user where email=? and password=?", [req.body.email, req.body.password]);
        if (result.length) {
            res.json("API TOKEN : token")
        } else {
            res.status(401).json({error: "로그인 실패"})
        }

    } catch (e) {
        res.status(409).json({error: e.message})
    }
}).post("/users/:id/allocations", function (req, res, next) {
    try {
        const data = {
            "customer": req.params.id,
            "dest_address": req.body.address,
            "create_date": moment().format("YYYY-MM-DD HH:mm:ss")
        }
        const checkUser = DB().queryFirstRow("select type from user where id=?", req.params.id).type;
        if (checkUser === 1) {
            res.json("driver user is not allowed ")
        } else {
            const result = DB().insert("allocation", data)
            res.status(200).json(result)
        }
    } catch (e) {
        res.status(409).json({error: e.message})
    }
}).put("/drivers/:id/allocations/:allocationId", function (req, res, next) {
    try {
        const {id, allocationId} = req.params;
        const data = {
            "driver": id,
            "allocation_time": moment().format("YYYY-MM-DD HH:mm:ss")
        }
        const checkDrvier = DB().queryFirstRow("select type from user where id=?", id).type;
        if (checkDrvier === 0) {
            res.json("드라이버 사용자가 아닙니다.")
        } else {
            const allocationStatus = DB().queryFirstRow("select status from allocation where id=?", allocationId).status;
            if (allocationStatus !== 0) {
                res.json("이미 배차가 완료된 건입니다.")
            } else {
                const result = DB().update("allocation", data, ["id=?", allocationId]);
                res.json("신청한 배차 요청건에 배차되었습니다.")
            }
        }
    } catch (e) {
        res.status(409).json({error: e.message})
    }
});

router.get("/allocations", function (req, res, next) {
    try {
        let query = "select * from allocation";
        const order = " order by id desc";
        let result = null;
        if (checkUndefined(req.query.status)) {
            query = query + " where status = ?" + order;
            result = DB().query(query, req.query.status)
        } else {
            result = DB().query(query + order)
            result.forEach(function (item) {
                item.status = statusCodeConverter(item.status)
            })
        }
        res.json(result)

    } catch (e) {
        res.status(409).json({error: e.message})
    }
});

module.exports = router;
