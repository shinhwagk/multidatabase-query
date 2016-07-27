package models

import java.sql.{Connection, ResultSet, Statement}
import java.util.Properties

import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import models.DataSwopObject.JdbcReslt
import play.api.libs.json.Json

import scala.collection.mutable.ArrayBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by zhangxu on 2016/7/26.
  */
object QueryServices {

  def generateQueryJsonResult(server: String, sqlText: String): Future[JdbcReslt] = {
    Future {
      Thread.sleep(1000)
      val sql = sqlText
      var conn: Connection = null
      var stmt: Statement = null
      var rs: ResultSet = null
      try {
        conn = orclConnPool(server).getConnection
        stmt = conn.createStatement()
        stmt.setQueryTimeout(10)
        rs = stmt.executeQuery(sql)
        val METADATE = rs.getMetaData
        val COLUMN_COUNT = METADATE.getColumnCount
        val rows = new ArrayBuffer[Map[String, String]]()
        import scala.collection.mutable.Map
        while (rs.next()) {
          val row: Map[String, String] = Map.empty
          for (i <- 2 to COLUMN_COUNT) {
            row += (METADATE.getColumnName(i) -> (if (rs.getString(i) == null) "" else rs.getString(i)))
          }
          rows += row.toMap
        }
        println(Json.toJson(rows).toString())
        JdbcReslt(result = Some(Json.toJson(rows).toString()))
      } catch {
        case ex: Exception => JdbcReslt(errorString = Some(ex.getMessage))
      } finally {
        if (rs != null) {
          rs.close()
        }
        if (stmt != null) {
          stmt.close()
        }
        if (stmt != conn) {
          conn.close()
        }
      }
    }
  }

  def generateQueryAstrictSql(sql: String): String = {
    val querynumber = Parameter._query_number
    s"""SELECT * FROM ($sql) WHERE ROWNUM < ${querynumber}"""
  }

  def generateQueryFullTableSql(sql: String, page: Int): String = {
    val pageSpan = Parameter._query_page_span
    s"""SELECT * FROM (SELECT ROWNUM RN, A.* FROM ($sql) A WHERE ROWNUM < ${(page + 1) * pageSpan}) WHERE RN >= ${page * pageSpan}"""
  }

  private val whdb2 = {
    val props = new Properties();
    props.setProperty("jdbcUrl", "jdbc:oracle:thin:@10.65.193.11:1521/whpay");
    props.setProperty("dataSource.user", "system");
    props.setProperty("dataSource.password", "oracle1171");
    new HikariDataSource(new HikariConfig(props));
  }

  private val cloud = {
    val props = new Properties();
    props.setProperty("jdbcUrl", "jdbc:oracle:thin:@10.65.193.37:1521/cloud");
    props.setProperty("dataSource.user", "system");
    props.setProperty("dataSource.password", "oracle1171");
    new HikariDataSource(new HikariConfig(props));
  }
  private val whpay = {
    val props = new Properties();
    props.setProperty("jdbcUrl", "jdbc:oracle:thin:@10.65.193.11:1521/whpay");
    props.setProperty("dataSource.user", "system");
    props.setProperty("dataSource.password", "oracle1171");
    new HikariDataSource(new HikariConfig(props));
  }

  val orclConnPool: Map[String, HikariDataSource] = Map("whdb2" -> whdb2, "cloud" -> cloud, "whpay" -> whpay)
}
