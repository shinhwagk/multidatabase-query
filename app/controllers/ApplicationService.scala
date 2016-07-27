package controllers

import models.DataSwopObject.{JdbcReslt, QueryConfig, QueryReslt}
import models.{DatabaseDao, QueryServices}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Controller, Result}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by zhangxu on 2016/7/25.
  */

object ApplicationService extends Controller {

  def loginService(f: Boolean, username: String): Future[Result] = f match {
    case true => initUserIfNoExist(username)
      //      .flatMap(DatabaseDao.getUserData(_)
      .map(user => Ok(user).withSession("username" -> user))
    case false => Future.successful(Unauthorized)
  }

  def checkUserExist(username: String): Future[Boolean] = {
    DatabaseDao.getUserCount(username).map(p => if (p > 0) true else false)
  }

  def initUserIfNoExist(username: String): Future[String] = {
    checkUserExist(username).flatMap(p => p match {
      case false => DatabaseDao.initUser(username).map(p => username)
      case true => Future.successful(username)
    })
  }

  def executeQuery(username: String, qrb: QueryConfig): Future[QueryReslt] = {
    if (qrb.queryfull) {
      checkLastSqlText(username, qrb.sqltext).flatMap(p => p match {
        case true =>
          executeQueryFullResult(qrb.server, qrb.sqltext, qrb.offset).map(executeQueryJdbcResultToQueryReslt)
        case false =>
          for {i <- DatabaseDao.updateFullQueryNumber(username)
               s <- if (i > 0) executeQueryFullResult(qrb.server, qrb.sqltext, qrb.offset).map(executeQueryJdbcResultToQueryReslt)
               else Future.successful(QueryReslt(error = true, errorString = Some("查询次数为0")))
          } yield s
      })
    } else {
      executeQueryPartResult(qrb.server, qrb.sqltext).map(executeQueryJdbcResultToQueryReslt)
    }
  }

  def checkLastSqlText(username: String, sqlText: String): Future[Boolean] = {
    DatabaseDao.getLastQuerySqls(username).map(p => if (p.hashCode == sqlText.hashCode) true else false)
  }

  def executeQueryFullResult(server: String, sqlText: String, page: Int): Future[JdbcReslt] = {
    val sql = QueryServices.generateQueryFullTableSql(sqlText, page)
    QueryServices.generateQueryJsonResult(server, sql)
  }

  def executeQueryPartResult(server: String, sqlText: String): Future[JdbcReslt] = {
    val sql = QueryServices.generateQueryAstrictSql(sqlText)
    QueryServices.generateQueryJsonResult(server, sql)
  }

  def executeQueryJdbcResultToQueryReslt(jr: JdbcReslt): QueryReslt = {
    if (!jr.errorString.isEmpty) {
      QueryReslt(error = true, errorString = jr.errorString)
    } else {
      QueryReslt(result = jr.result)
    }
  }

}
