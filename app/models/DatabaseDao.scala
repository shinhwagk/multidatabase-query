package models

import models.DataSwopObject.Users
import play.api.Play
import play.api.db.slick.DatabaseConfigProvider
import play.api.libs.json.Json
import slick.driver.JdbcProfile

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by zhangxu on 2016/7/25.
  *
  *
  * {
  * "id":1,
  * "username":"?",
  * "sqlgroups":["xxx"],
  * "allquerynumber":?,
  * "privilege":["xx"]组,
  * "amdin":1
  * }
  *
  */
object DatabaseDao {
  val table = "wex_app_OracleSqlQuery"
  private val dbConfig = DatabaseConfigProvider.get[JdbcProfile](Play.current)
  //  private val db = dbConfig.db
  import dbConfig.driver.api._

  private val db = dbConfig.db

  /** test */
  def getUser(username: String): Future[String] =
    db.run(sql"""select data from wex_app_OracleSqlQuery.users where username = $username""".as[String].head)

  /** test */
  def initUser(username: String): Future[Int] = {
    implicit val userWrites = Json.writes[Users]
    val user: Users = Users(username = username)
    val userJson: String = Json.toJson(user).toString()
    db.run(sqlu"""insert into wex_app_OracleSqlQuery.users(data) values(${userJson})""")
  }

  /** test */
  def getUserCount(username: String): Future[Int] = {
    db.run(sql"""select count(*) from wex_app_OracleSqlQuery.users where username = $username""".as[Int].head)
  }

  def getSqlsGroups(username: String): Future[String] = {
    db.run(sql"""select json_keys(data,'$$.sqlgroups') groups from wex_app_OracleSqlQuery.users where username = $username""".as[String].head)
  }

  def getSqlsTextsOfGroup(username: String, group: String): Future[String] = {
    db.run(sql"""select JSON_KEYS(data->'$$.data.sqlgroups') from wex_app_OracleSqlQuery.users where username = $username""".as[String].head)
  }


  def getSqlsUsers(username: String): Future[String] = {
    db.run(sql"""select JSON_KEYS(data->'$$.data.sqlgroups') from ${table}.users where user user = $username""".as[String].head)
  }

  def getSqlsTextSOfUser(username: String, user: String): Future[String] = {
    db.run(sql"""select JSON_KEYS(data->'$$.data.sqlgroups') from ${table}.users where user user = $username""".as[String].head)
  }

  /** test */
  def getServer = {
    db.run(sql"""select JSON_UNQUOTE(data->'$$.alias') from wex_app_OracleSqlQuery.dbserver""".as[String])
  }

  def getLastQuerySqls(username: String) = {
    db.run(sql"""select JSON_UNQUOTE(data->'$$.lastsql') from wex_app_OracleSqlQuery.username = $username""".as[String].head)
  }

  def updateLastQuerySqls(username: String, sqlText: String): Future[Int] = {
    Future.successful(1)

  }

  def getFullQueryNumber(username: String): Future[Int] = {
    db.run(sql"""select data->'$$.allquerynumber' from wex_app_OracleSqlQuery.users where username = $username""".as[Int].head)
  }

  def updateFullQueryNumber(username: String): Future[Int] = {
    Future.successful(1)
  }

  def getAllSchemas: Future[List[String]] = ???

  def getUserAllowSchemas(username:String): Future[List[String]] = ???
}
