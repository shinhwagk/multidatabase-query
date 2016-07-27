package controllers

import models.DataSwopObject.{QueryConfig, QueryReslt}
import models.{DatabaseDao, Tools}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class Application extends Controller {
  implicit def extractUsername[T](request: Request[T]): String = request.session.get("username").get

  implicit def extractQueryResultObject(jsValue: Option[JsValue]): QueryConfig = {
    implicit val residentReads = Json.reads[QueryConfig]
    jsValue.map(_.as[QueryConfig]).get
  }

  //  def index = Action { implicit request =>
  //    Ok("A")
  //  }

  def login = Action.async { request =>
    request.body.asJson match {
      case Some(p) =>
        val username = (p \ "username").as[String]
        val password = (p \ "password").as[String]
        Tools.authLDAP(username, password).flatMap(ApplicationService.loginService(_, username))
      case None => Future.successful(InternalServerError("a"))
    }
  }

  def logout = Action { request =>
    Ok("").withNewSession
  }

  def sqlGroups = Action.async { request =>
    DatabaseDao.getSqlsGroups(request).map(Ok(_))
  }

  def sqlTextsOfGroup(group: String) = Action.async { request =>
    DatabaseDao.getSqlsTextsOfGroup(request, group).map(Ok(_))
  }

  def sqlUsers = Action.async { request =>
    DatabaseDao.getSqlsUsers(request).map(Ok(_))
  }

  def sqlTextsOfUser(user: String) = Action.async { request =>
    DatabaseDao.getSqlsTextSOfUser(request, user).map(Ok(_))
  }

  def user = Action.async { request =>
    DatabaseDao.getUser(request).map(Ok(_))
  }

  def dbserver = Action.async {
    DatabaseDao.getServer.map(sers => Ok(Json.stringify(Json.toJson(sers.toList))))
  }

  def executeQuery = Action.async { request =>
    implicit val queryResltWrites = Json.writes[QueryReslt]
    ApplicationService.executeQuery(request, request.body.asJson).map(p =>
      if (p.error) {
        InternalServerError(Json.toJson(p).toString())
      } else {
        Ok(Json.toJson(p).toString())
      }
    )
  }
}